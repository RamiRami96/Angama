import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import { CONFIRMED_STATUSES } from './events.mapper';
import { EventsService } from './events.service';
import { ParticipationsService } from './participations.service';

const HOUR = 3_600_000;
const future = new Date(Date.now() + 24 * HOUR);
const futureEnd = new Date(future.getTime() + 2 * HOUR);
const past = new Date(Date.now() - 24 * HOUR);

function eventRow(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'e1',
    startsAt: future,
    endsAt: futureEnd,
    maxParticipants: 2,
    status: 'PUBLISHED',
    organizerId: 'org',
    category: { id: 'cat', code: 'BOARD_GAMES', name: 'Board games' },
    ...over,
  };
}

function participation(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'p1',
    userId: 'u1',
    eventId: 'e1',
    status: 'REQUESTED',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...over,
  };
}

function setup(row: ReturnType<typeof eventRow> | null = eventRow()) {
  // Locked work must go through the transaction client, so `tx` is a separate
  // mock: a write on the plain client shows up as a failed assertion.
  const tx = {
    event: { findUniqueOrThrow: jest.fn().mockResolvedValue(row) },
    eventParticipant: {
      findUnique: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
      create: jest
        .fn()
        .mockImplementation(({ data }: { data: Record<string, unknown> }) =>
          participation(data),
        ),
      update: jest
        .fn()
        .mockImplementation(({ data }: { data: Record<string, unknown> }) =>
          participation(data),
        ),
    },
    notification: { create: jest.fn().mockResolvedValue({}) },
    $queryRaw: jest.fn().mockResolvedValue([]),
  };
  const db = {
    event: { findUnique: jest.fn().mockResolvedValue(row) },
    eventParticipant: { findMany: jest.fn().mockResolvedValue([]) },
    $transaction: jest
      .fn()
      .mockImplementation((fn: (client: typeof tx) => unknown) => fn(tx)),
  };
  const prisma = db as unknown as PrismaService;
  return {
    db,
    tx,
    service: new ParticipationsService(prisma, new EventsService(prisma)),
  };
}

function firstArg<T>(fn: jest.Mock): T {
  return (fn.mock.calls as unknown[][])[0][0] as T;
}

describe('ParticipationsService.request', () => {
  it('404s for an unknown event', async () => {
    const { service } = setup(null);
    await expect(service.request('e1', 'u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('forbids the organizer from joining their own event', async () => {
    const { service, tx } = setup();
    await expect(service.request('e1', 'org')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(tx.eventParticipant.create).not.toHaveBeenCalled();
  });

  it("404s for someone else's DRAFT (no existence leak)", async () => {
    const { service, tx } = setup(eventRow({ status: 'DRAFT' }));
    await expect(service.request('e1', 'u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(tx.eventParticipant.create).not.toHaveBeenCalled();
  });

  it('still forbids the organizer on their own DRAFT', async () => {
    const { service } = setup(eventRow({ status: 'DRAFT' }));
    await expect(service.request('e1', 'org')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it.each(['CANCELLED', 'COMPLETED'])('rejects a %s event', async (status) => {
    const { service, tx } = setup(eventRow({ status }));
    await expect(service.request('e1', 'u1')).rejects.toThrow(
      'Event is not open',
    );
    expect(tx.eventParticipant.create).not.toHaveBeenCalled();
  });

  it('rejects a PUBLISHED event that has already started (stale status)', async () => {
    const { service, tx } = setup(eventRow({ startsAt: past }));
    await expect(service.request('e1', 'u1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(tx.eventParticipant.create).not.toHaveBeenCalled();
  });

  it.each(['REQUESTED', 'APPROVED', 'CANCELLED', 'REJECTED', 'ATTENDED'])(
    'conflicts when a %s row already exists',
    async (status) => {
      const { service, tx } = setup();
      tx.eventParticipant.findUnique.mockResolvedValue(
        participation({ status }),
      );
      await expect(service.request('e1', 'u1')).rejects.toThrow(
        'Already requested',
      );
      expect(tx.eventParticipant.create).not.toHaveBeenCalled();
      expect(tx.notification.create).not.toHaveBeenCalled();
    },
  );

  it('conflicts when confirmed participants fill the event, creating nothing', async () => {
    const { service, tx } = setup(eventRow({ maxParticipants: 2 }));
    tx.eventParticipant.count.mockResolvedValue(2);
    await expect(service.request('e1', 'u1')).rejects.toThrow('Event is full');
    expect(tx.eventParticipant.count).toHaveBeenCalledWith({
      where: { eventId: 'e1', status: { in: CONFIRMED_STATUSES } },
    });
    expect(tx.eventParticipant.create).not.toHaveBeenCalled();
    expect(tx.notification.create).not.toHaveBeenCalled();
  });

  it('creates a REQUESTED row and one notification to the organizer', async () => {
    const { service, tx } = setup();
    await expect(service.request('e1', 'u1')).resolves.toEqual({
      userId: 'u1',
      eventId: 'e1',
      status: 'REQUESTED',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(tx.eventParticipant.create).toHaveBeenCalledWith({
      data: { eventId: 'e1', userId: 'u1', status: 'REQUESTED' },
    });
    expect(tx.notification.create).toHaveBeenCalledTimes(1);
    expect(tx.notification.create).toHaveBeenCalledWith({
      data: {
        type: 'PARTICIPATION_REQUESTED',
        eventId: 'e1',
        userId: 'org',
        actorId: 'u1',
      },
    });
  });

  it('takes the event row lock before counting participants', async () => {
    const { service, tx } = setup();
    await service.request('e1', 'u1');
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.eventParticipant.count.mock.invocationCallOrder[0],
    );
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.event.findUniqueOrThrow.mock.invocationCallOrder[0],
    );
  });
});

describe('ParticipationsService decisions', () => {
  it('approves a pending request when there is room and notifies the participant', async () => {
    const { service, tx } = setup(eventRow({ maxParticipants: 2 }));
    tx.eventParticipant.findUnique.mockResolvedValue(participation());
    tx.eventParticipant.count.mockResolvedValue(1);
    await expect(service.approve('e1', 'u1', 'org')).resolves.toMatchObject({
      status: 'APPROVED',
    });
    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.eventParticipant.count.mock.invocationCallOrder[0],
    );
    expect(tx.notification.create).toHaveBeenCalledWith({
      data: {
        type: 'PARTICIPATION_APPROVED',
        eventId: 'e1',
        userId: 'u1',
        actorId: 'org',
      },
    });
  });

  it('refuses to approve at capacity', async () => {
    const { service, tx } = setup(eventRow({ maxParticipants: 2 }));
    tx.eventParticipant.findUnique.mockResolvedValue(participation());
    tx.eventParticipant.count.mockResolvedValue(2);
    await expect(service.approve('e1', 'u1', 'org')).rejects.toThrow(
      'Event is full',
    );
    expect(tx.eventParticipant.update).not.toHaveBeenCalled();
    expect(tx.notification.create).not.toHaveBeenCalled();
  });

  it('rejects (even when full) and notifies the participant', async () => {
    const { service, tx } = setup(eventRow({ maxParticipants: 2 }));
    tx.eventParticipant.findUnique.mockResolvedValue(participation());
    tx.eventParticipant.count.mockResolvedValue(2);
    await expect(service.reject('e1', 'u1', 'org')).resolves.toMatchObject({
      status: 'REJECTED',
    });
    expect(tx.notification.create).toHaveBeenCalledWith({
      data: {
        type: 'PARTICIPATION_REJECTED',
        eventId: 'e1',
        userId: 'u1',
        actorId: 'org',
      },
    });
  });

  it('404s for an unknown participant', async () => {
    const { service } = setup();
    await expect(service.approve('e1', 'ghost', 'org')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('is idempotent when already at the target status', async () => {
    const { service, tx } = setup();
    tx.eventParticipant.findUnique.mockResolvedValue(
      participation({ status: 'APPROVED' }),
    );
    await expect(service.approve('e1', 'u1', 'org')).resolves.toMatchObject({
      status: 'APPROVED',
    });
    expect(tx.eventParticipant.update).not.toHaveBeenCalled();
    expect(tx.notification.create).not.toHaveBeenCalled();
  });

  it.each(['CANCELLED', 'REJECTED'])(
    'conflicts approving a %s row',
    async (status) => {
      const { service, tx } = setup();
      tx.eventParticipant.findUnique.mockResolvedValue(
        participation({ status }),
      );
      await expect(service.approve('e1', 'u1', 'org')).rejects.toThrow(
        'Request is no longer pending',
      );
    },
  );

  it.each([
    ['CANCELLED', eventRow({ status: 'CANCELLED' })],
    ['COMPLETED', eventRow({ status: 'COMPLETED' })],
    ['ended (stale PUBLISHED)', eventRow({ startsAt: past, endsAt: past })],
  ])('conflicts deciding on a %s event', async (_n, row) => {
    const { service, tx } = setup(row);
    tx.eventParticipant.findUnique.mockResolvedValue(participation());
    await expect(service.approve('e1', 'u1', 'org')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(tx.eventParticipant.update).not.toHaveBeenCalled();
  });

  it('forbids a non-organizer from approving', async () => {
    const { service, tx } = setup();
    await expect(
      service.approve('e1', 'u1', 'intruder'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(tx.eventParticipant.update).not.toHaveBeenCalled();
  });
});

describe('ParticipationsService.cancel', () => {
  it('404s when the user has no participation', async () => {
    const { service } = setup();
    await expect(service.cancel('e1', 'u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it.each(['REQUESTED', 'APPROVED'])(
    'cancels a %s participation without notifying',
    async (status) => {
      const { service, tx } = setup();
      tx.eventParticipant.findUnique.mockResolvedValue(
        participation({ status }),
      );
      await expect(service.cancel('e1', 'u1')).resolves.toMatchObject({
        status: 'CANCELLED',
      });
      expect(tx.eventParticipant.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { status: 'CANCELLED' },
      });
      expect(tx.notification.create).not.toHaveBeenCalled();
    },
  );

  it.each(['REJECTED', 'CANCELLED', 'ATTENDED'])(
    'conflicts cancelling from %s',
    async (status) => {
      const { service, tx } = setup();
      tx.eventParticipant.findUnique.mockResolvedValue(
        participation({ status }),
      );
      await expect(service.cancel('e1', 'u1')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(tx.eventParticipant.update).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['COMPLETED', eventRow({ status: 'COMPLETED' })],
    ['ended (stale PUBLISHED)', eventRow({ startsAt: past, endsAt: past })],
  ])('conflicts cancelling on a %s event', async (_n, row) => {
    const { service, tx } = setup(row);
    tx.eventParticipant.findUnique.mockResolvedValue(
      participation({ status: 'APPROVED' }),
    );
    await expect(service.cancel('e1', 'u1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(tx.eventParticipant.update).not.toHaveBeenCalled();
  });
});

describe('ParticipationsService.list', () => {
  const row = {
    ...participation(),
    user: { id: 'u1', name: 'Ann', avatarUrl: null },
  };

  it('lists everything except CANCELLED by default, with the user', async () => {
    const { service, db } = setup();
    db.eventParticipant.findMany.mockResolvedValue([row]);
    await expect(service.list('e1', 'org')).resolves.toEqual([
      {
        userId: 'u1',
        eventId: 'e1',
        status: 'REQUESTED',
        createdAt: '2026-01-01T00:00:00.000Z',
        user: { id: 'u1', name: 'Ann' },
      },
    ]);
    const { where } = firstArg<{ where: object }>(db.eventParticipant.findMany);
    expect(where).toEqual({ eventId: 'e1', status: { not: 'CANCELLED' } });
  });

  it('filters by status when given', async () => {
    const { service, db } = setup();
    await service.list('e1', 'org', 'APPROVED');
    const { where } = firstArg<{ where: object }>(db.eventParticipant.findMany);
    expect(where).toEqual({ eventId: 'e1', status: 'APPROVED' });
  });

  it('forbids a non-organizer', async () => {
    const { service, db } = setup();
    await expect(service.list('e1', 'stranger')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(db.eventParticipant.findMany).not.toHaveBeenCalled();
  });
});
