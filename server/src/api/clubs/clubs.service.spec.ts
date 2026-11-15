import { ConflictException, NotFoundException } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import type { PrismaService } from '../../prisma/prisma.service';

const future = new Date(Date.now() + 86_400_000);
const past = new Date(Date.now() - 86_400_000);

function setup(
  club: Partial<{
    id: string;
    hostId: string;
    maxMembers: number;
    status: string;
    startDate: Date;
  }> | null = {},
) {
  const clubRow = club && {
    id: 'c1',
    hostId: 'host',
    maxMembers: 2,
    status: 'ACTIVE',
    startDate: future,
    ...club,
  };
  const db = {
    club: {
      findUnique: jest.fn().mockResolvedValue(clubRow),
      findUniqueOrThrow: jest.fn().mockResolvedValue(clubRow),
    },
    registration: {
      findUnique: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
      upsert: jest
        .fn()
        .mockImplementation(({ create }: { create: object }) => create),
      update: jest.fn().mockImplementation(({ data }: { data: object }) => ({
        id: 'r1',
        ...data,
      })),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
    $transaction: jest.fn(),
  };
  db.$transaction.mockImplementation((fn: (tx: typeof db) => unknown) =>
    fn(db),
  );
  const service = new ClubsService(db as unknown as PrismaService);
  return { service, db };
}

describe('ClubsService.apply', () => {
  it('404s for an unknown club', async () => {
    const { service } = setup(null);
    await expect(service.apply('c1', 'u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns an existing registration without re-checking club state', async () => {
    const { service, db } = setup({ status: 'CANCELLED' });
    db.registration.findUnique.mockResolvedValue({ id: 'old' });
    await expect(service.apply('c1', 'u1')).resolves.toEqual({ id: 'old' });
    expect(db.registration.upsert).not.toHaveBeenCalled();
  });

  it.each([
    ['cancelled', { status: 'CANCELLED' }, /cancelled/],
    ['already started', { startDate: past }, /started/],
  ])('rejects applications to a club that is %s', async (_n, club, msg) => {
    const { service } = setup(club);
    await expect(service.apply('c1', 'u1')).rejects.toThrow(msg);
  });

  it('rejects applications when approved members fill the club', async () => {
    const { service, db } = setup({ maxMembers: 2 });
    db.registration.count.mockResolvedValue(2);
    await expect(service.apply('c1', 'u1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('creates a PENDING listener registration otherwise', async () => {
    const { service } = setup();
    await expect(service.apply('c1', 'u1')).resolves.toMatchObject({
      userId: 'u1',
      clubId: 'c1',
      role: 'LISTENER',
      status: 'PENDING',
    });
  });
});

describe('ClubsService applicant decisions', () => {
  const pending = { id: 'r1', status: 'PENDING' };

  it('approves a pending applicant when there is room', async () => {
    const { service, db } = setup({ maxMembers: 2 });
    db.registration.findUnique.mockResolvedValue(pending);
    db.registration.count.mockResolvedValue(1);
    await expect(
      service.acceptApplicant('c1', 'u1', 'host'),
    ).resolves.toMatchObject({ status: 'APPROVED' });
    expect(db.$queryRaw).toHaveBeenCalled(); // club row locked
  });

  it('refuses to approve beyond maxMembers', async () => {
    const { service, db } = setup({ maxMembers: 2 });
    db.registration.findUnique.mockResolvedValue(pending);
    db.registration.count.mockResolvedValue(2);
    await expect(service.acceptApplicant('c1', 'u1', 'host')).rejects.toThrow(
      /full/,
    );
    expect(db.registration.update).not.toHaveBeenCalled();
  });

  it('can still reject when the club is full', async () => {
    const { service, db } = setup({ maxMembers: 2 });
    db.registration.findUnique.mockResolvedValue(pending);
    db.registration.count.mockResolvedValue(2);
    await expect(
      service.rejectApplicant('c1', 'u1', 'host'),
    ).resolves.toMatchObject({ status: 'REJECTED' });
  });

  it('404s for an unknown applicant instead of a Prisma 500', async () => {
    const { service } = setup();
    await expect(
      service.acceptApplicant('c1', 'ghost', 'host'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('is idempotent when already in the target state', async () => {
    const { service, db } = setup();
    db.registration.findUnique.mockResolvedValue({
      id: 'r1',
      status: 'APPROVED',
    });
    await expect(
      service.acceptApplicant('c1', 'u1', 'host'),
    ).resolves.toMatchObject({ status: 'APPROVED' });
    expect(db.registration.update).not.toHaveBeenCalled();
  });

  it('conflicts when the application is no longer pending', async () => {
    const { service, db } = setup();
    db.registration.findUnique.mockResolvedValue({
      id: 'r1',
      status: 'CANCELLED',
    });
    await expect(
      service.acceptApplicant('c1', 'u1', 'host'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('forbids non-hosts', async () => {
    const { service } = setup();
    await expect(
      service.acceptApplicant('c1', 'u1', 'intruder'),
    ).rejects.toMatchObject({ status: 403 });
  });
});
