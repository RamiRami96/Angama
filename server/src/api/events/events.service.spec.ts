import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { CreateEventDto } from '../../contracts';
import type { PrismaService } from '../../prisma/prisma.service';
import { CONFIRMED_STATUSES } from './events.mapper';
import { EventsService } from './events.service';

const HOUR = 3_600_000;
const future = new Date(Date.now() + 24 * HOUR);
const futureEnd = new Date(future.getTime() + 2 * HOUR);
const past = new Date(Date.now() - 24 * HOUR);

function eventRow(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'e1',
    name: 'Chess',
    description: '',
    details: { game: 'Chess', experienceLevel: 'BEGINNER' },
    coverImageUrl: null,
    startsAt: future,
    endsAt: futureEnd,
    city: 'Berlin',
    address: 'Main St 1',
    maxParticipants: 5,
    price: null,
    status: 'PUBLISHED',
    createdAt: new Date(),
    updatedAt: new Date(),
    categoryId: 'cat',
    languageId: 'lang',
    organizerId: 'org',
    organizer: { id: 'org', name: 'O', avatarUrl: null },
    category: { id: 'cat', code: 'BOARD_GAMES', name: 'Board games' },
    language: { id: 'lang', code: 'en', name: 'English' },
    participants: [],
    ...over,
  };
}

function setup(row: ReturnType<typeof eventRow> | null = eventRow()) {
  const language = () => ({
    findUnique: jest
      .fn()
      .mockResolvedValue({ id: 'lang', code: 'en', name: 'English' }),
  });
  // Locked writes must go through the transaction client, so `tx` is a
  // separate mock: a write on the plain client shows up as a failed assertion.
  const tx = {
    event: {
      findUniqueOrThrow: jest.fn().mockResolvedValue(row),
      update: jest
        .fn()
        .mockImplementation(({ data }: { data: object }) =>
          eventRow({ ...row, ...(data as Record<string, unknown>) }),
        ),
    },
    language: language(),
    eventParticipant: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
    },
    notification: {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
  };
  const db = {
    event: {
      findMany: jest.fn().mockResolvedValue(row ? [row] : []),
      findUnique: jest.fn().mockResolvedValue(row),
      create: jest
        .fn()
        .mockImplementation(({ data }: { data: object }) => eventRow(data)),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    eventCategory: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'cat', code: 'BOARD_GAMES', name: 'B' }),
    },
    language: language(),
    eventParticipant: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    $transaction: jest
      .fn()
      .mockImplementation((fn: (client: typeof tx) => unknown) => fn(tx)),
  };
  return {
    db,
    tx,
    service: new EventsService(db as unknown as PrismaService),
  };
}

function firstArg<T>(fn: jest.Mock): T {
  return (fn.mock.calls as unknown[][])[0][0] as T;
}

const payload: CreateEventDto = {
  name: 'Chess',
  description: '',
  category: 'BOARD_GAMES',
  details: { game: 'Chess', experienceLevel: 'BEGINNER' },
  startsAt: future.toISOString(),
  endsAt: futureEnd.toISOString(),
  city: 'Berlin',
  address: 'Main St 1',
  maxParticipants: 5,
  language: 'EN',
  status: 'PUBLISHED',
};

describe('EventsService.list', () => {
  it('completes finished events, then lists only PUBLISHED, capped', async () => {
    const { service, db } = setup();
    await service.list(undefined, {});
    expect(db.event.updateMany).toHaveBeenCalled();
    expect(db.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'PUBLISHED' },
        orderBy: { startsAt: 'asc' },
        take: 100,
      }),
    );
  });

  it('applies every filter when provided', async () => {
    const { service, db } = setup();
    await service.list(undefined, {
      q: 'chess',
      category: 'BOARD_GAMES',
      language: 'EN',
      city: 'berlin',
    });
    const { where } = firstArg<{ where: object }>(db.event.findMany);
    expect(where).toEqual({
      status: 'PUBLISHED',
      name: { contains: 'chess', mode: 'insensitive' },
      category: { code: 'BOARD_GAMES' },
      language: { code: 'en' },
      city: { equals: 'berlin', mode: 'insensitive' },
    });
  });

  it('bounds startsAt to the UTC day of `date`', async () => {
    const { service, db } = setup();
    await service.list(undefined, { date: '2030-03-05' });
    const { where } = firstArg<{
      where: { startsAt: { gte: Date; lt: Date } };
    }>(db.event.findMany);
    expect(where.startsAt.gte.toISOString()).toBe('2030-03-05T00:00:00.000Z');
    expect(where.startsAt.lt.toISOString()).toBe('2030-03-06T00:00:00.000Z');
  });

  it('looks up a viewer participation that is not in the included rows', async () => {
    const { service, db } = setup();
    db.eventParticipant.findMany.mockResolvedValue([
      { eventId: 'e1', status: 'CANCELLED' },
    ]);
    const [dto] = await service.list('viewer', {});
    expect(dto.myParticipation).toBe('CANCELLED');
    expect(db.eventParticipant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          eventId: { in: ['e1'] },
          userId: 'viewer',
        }) as object,
      }),
    );
  });

  it('does not look up participations for anonymous viewers', async () => {
    const { service, db } = setup();
    await service.list(undefined, {});
    expect(db.eventParticipant.findMany).not.toHaveBeenCalled();
  });
});

describe('EventsService.getOne', () => {
  it('404s for an unknown event', async () => {
    const { service } = setup(null);
    await expect(service.getOne('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('hides a DRAFT from everyone but its organizer', async () => {
    const { service } = setup(eventRow({ status: 'DRAFT' }));
    await expect(service.getOne('e1', 'other')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.getOne('e1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.getOne('e1', 'org')).resolves.toMatchObject({
      id: 'e1',
      status: 'DRAFT',
    });
  });
});

describe('EventsService.create', () => {
  it('creates with resolved category/language and validated details', async () => {
    const { service, db } = setup();
    await service.create('org', payload);
    expect(db.event.findMany).not.toHaveBeenCalled();
    expect(db.language.findUnique).toHaveBeenCalledWith({
      where: { code: 'en' },
    });
    const { data } = firstArg<{ data: Record<string, unknown> }>(
      db.event.create,
    );
    expect(data).toMatchObject({
      organizerId: 'org',
      categoryId: 'cat',
      languageId: 'lang',
      status: 'PUBLISHED',
      details: { game: 'Chess', experienceLevel: 'BEGINNER' },
    });
    expect(data.startsAt).toEqual(future);
  });

  it('does not enforce a one-upcoming-event limit', async () => {
    const { service, db } = setup();
    await service.create('org', payload);
    await service.create('org', payload);
    expect(db.event.create).toHaveBeenCalledTimes(2);
  });

  it('rejects a start in the past', async () => {
    const { service, db } = setup();
    await expect(
      service.create('org', {
        ...payload,
        startsAt: past.toISOString(),
        endsAt: future.toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(db.event.create).not.toHaveBeenCalled();
  });

  it('rejects an unknown language', async () => {
    const { service, db } = setup();
    db.language.findUnique.mockResolvedValue(null);
    await expect(service.create('org', payload)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(db.event.create).not.toHaveBeenCalled();
  });
});

describe('EventsService.update', () => {
  it('only lets the organizer edit', async () => {
    const { service, tx } = setup();
    await expect(
      service.update('e1', 'intruder', { name: 'x' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(tx.event.update).not.toHaveBeenCalled();
  });

  it('refuses to edit a CANCELLED or COMPLETED event', async () => {
    for (const status of ['CANCELLED', 'COMPLETED']) {
      const { service, tx } = setup(eventRow({ status }));
      await expect(
        service.update('e1', 'org', { name: 'x' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(tx.event.update).not.toHaveBeenCalled();
    }
  });

  it('refuses a status change (publish/cancel endpoints only)', async () => {
    const { service, tx } = setup(eventRow({ status: 'PUBLISHED' }));
    await expect(
      service.update('e1', 'org', { status: 'DRAFT' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.event.update).not.toHaveBeenCalled();
  });

  it('accepts the unchanged status', async () => {
    const { service, tx } = setup(eventRow({ status: 'DRAFT' }));
    await service.update('e1', 'org', { status: 'DRAFT', name: 'y' });
    const { data } = firstArg<{ data: Record<string, unknown> }>(
      tx.event.update,
    );
    expect(data).not.toHaveProperty('status');
    expect(data.name).toBe('y');
  });

  it('refuses lowering maxParticipants below the confirmed count', async () => {
    const { service, tx } = setup();
    tx.eventParticipant.count.mockResolvedValue(2);
    await expect(
      service.update('e1', 'org', { maxParticipants: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.event.update).not.toHaveBeenCalled();
  });

  it('validates merged details against the stored category', async () => {
    const { service, tx } = setup();
    await service.update('e1', 'org', { details: { game: 'Go' } });
    const { data } = firstArg<{ data: Record<string, unknown> }>(
      tx.event.update,
    );
    expect(data.details).toEqual({ game: 'Go', experienceLevel: 'BEGINNER' });

    await expect(
      service.update('e1', 'org', { details: { game: '' } }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('re-checks endsAt > startsAt against the stored values', async () => {
    const { service, tx } = setup();
    await expect(
      service.update('e1', 'org', {
        startsAt: new Date(futureEnd.getTime() + HOUR).toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.event.update).not.toHaveBeenCalled();
  });

  it('resolves a new language code case-insensitively', async () => {
    const { service, tx } = setup();
    await service.update('e1', 'org', { language: 'DE' });
    expect(tx.language.findUnique).toHaveBeenCalledWith({
      where: { code: 'de' },
    });
  });

  it('locks the row, then re-reads status and counts on tx before updating', async () => {
    const { service, tx } = setup();
    await service.update('e1', 'org', { maxParticipants: 3 });

    expect(tx.$queryRaw).toHaveBeenCalled();
    const lock = tx.$queryRaw.mock.invocationCallOrder[0];
    const reread = tx.event.findUniqueOrThrow.mock.invocationCallOrder[0];
    const count = tx.eventParticipant.count.mock.invocationCallOrder[0];
    const update = tx.event.update.mock.invocationCallOrder[0];
    expect(lock).toBeLessThan(reread);
    expect(reread).toBeLessThan(count);
    expect(count).toBeLessThan(update);

    const { where } = firstArg<{
      where: { eventId: string; status: { in: string[] } };
    }>(tx.eventParticipant.count);
    expect(where.eventId).toBe('e1');
    expect(where.status.in).toEqual(CONFIRMED_STATUSES);
  });

  it('refuses an event that became CANCELLED after the lock', async () => {
    const { service, tx } = setup();
    tx.event.findUniqueOrThrow.mockResolvedValue(
      eventRow({ status: 'CANCELLED' }),
    );
    await expect(
      service.update('e1', 'org', { name: 'x' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.event.update).not.toHaveBeenCalled();
  });
});

describe('EventsService.publish', () => {
  it('publishes a DRAFT', async () => {
    const { service, tx } = setup(eventRow({ status: 'DRAFT' }));
    await service.publish('e1', 'org');
    expect(tx.event.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'e1' },
        data: { status: 'PUBLISHED' },
      }),
    );
  });

  it('refuses anything but a DRAFT', async () => {
    const { service, tx } = setup(eventRow({ status: 'PUBLISHED' }));
    await expect(service.publish('e1', 'org')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(tx.event.update).not.toHaveBeenCalled();
  });

  it('refuses a DRAFT whose start has passed', async () => {
    const { service } = setup(
      eventRow({ status: 'DRAFT', startsAt: past, endsAt: future }),
    );
    await expect(service.publish('e1', 'org')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('only lets the organizer publish', async () => {
    const { service } = setup(eventRow({ status: 'DRAFT' }));
    await expect(service.publish('e1', 'x')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('locks the row before re-reading the status, then updates on tx', async () => {
    const { service, tx } = setup(eventRow({ status: 'DRAFT' }));
    await service.publish('e1', 'org');
    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.event.findUniqueOrThrow.mock.invocationCallOrder[0],
    );
    expect(tx.event.findUniqueOrThrow.mock.invocationCallOrder[0]).toBeLessThan(
      tx.event.update.mock.invocationCallOrder[0],
    );
  });

  it('refuses a DRAFT that became CANCELLED after the lock', async () => {
    const { service, tx } = setup(eventRow({ status: 'DRAFT' }));
    tx.event.findUniqueOrThrow.mockResolvedValue(
      eventRow({ status: 'CANCELLED' }),
    );
    await expect(service.publish('e1', 'org')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(tx.event.update).not.toHaveBeenCalled();
  });
});

describe('EventsService.cancel', () => {
  it('locks the row, cancels and notifies REQUESTED/APPROVED participants', async () => {
    const { service, tx } = setup();
    tx.eventParticipant.findMany.mockResolvedValue([
      { userId: 'u1' },
      { userId: 'u2' },
    ]);
    await service.cancel('e1', 'org');

    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.event.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'e1' },
        data: { status: 'CANCELLED' },
      }),
    );
    expect(tx.eventParticipant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventId: 'e1', status: { in: ['REQUESTED', 'APPROVED'] } },
      }),
    );
    expect(tx.notification.createMany).toHaveBeenCalledWith({
      data: [
        {
          type: 'EVENT_CANCELLED',
          eventId: 'e1',
          userId: 'u1',
          actorId: 'org',
        },
        {
          type: 'EVENT_CANCELLED',
          eventId: 'e1',
          userId: 'u2',
          actorId: 'org',
        },
      ],
    });
  });

  it('refuses to cancel twice and sends no notifications', async () => {
    const { service, tx } = setup(eventRow({ status: 'CANCELLED' }));
    await expect(service.cancel('e1', 'org')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(tx.notification.createMany).not.toHaveBeenCalled();
    expect(tx.event.update).not.toHaveBeenCalled();
  });

  it('refuses to cancel a COMPLETED event', async () => {
    const { service } = setup(eventRow({ status: 'COMPLETED' }));
    await expect(service.cancel('e1', 'org')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('only lets the organizer cancel', async () => {
    const { service, tx } = setup();
    await expect(service.cancel('e1', 'x')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(tx.event.update).not.toHaveBeenCalled();
  });
});

describe('EventsService.completeFinished', () => {
  it('moves PUBLISHED events that have ended to COMPLETED', async () => {
    const { service, db } = setup();
    await service.completeFinished();
    const arg = firstArg<{
      where: { status: string; endsAt: { lt: Date } };
      data: object;
    }>(db.event.updateMany);
    expect(arg.where.status).toBe('PUBLISHED');
    expect(arg.where.endsAt.lt).toBeInstanceOf(Date);
    expect(Math.abs(arg.where.endsAt.lt.getTime() - Date.now())).toBeLessThan(
      5_000,
    );
    expect(arg.data).toEqual({ status: 'COMPLETED' });
  });
});

describe('EventsService.assertOrganizer', () => {
  it('404s for unknown, 403s for others, returns the event otherwise', async () => {
    const { service, db } = setup();
    await expect(service.assertOrganizer('e1', 'x')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(service.assertOrganizer('e1', 'org')).resolves.toMatchObject({
      id: 'e1',
    });
    db.event.findUnique.mockResolvedValue(null);
    await expect(service.assertOrganizer('e1', 'org')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
