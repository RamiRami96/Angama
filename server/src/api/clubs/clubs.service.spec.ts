import { ConflictException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import { ClubsService } from './clubs.service';

const future = new Date(Date.now() + 86_400_000);

function setup() {
  const clubRow = (over = {}) => ({
    id: 'c1',
    name: 'Chess',
    description: '',
    location: '',
    maxMembers: 5,
    status: 'ACTIVE',
    startDate: future,
    endDate: future,
    createdAt: new Date(),
    hostId: 'host',
    host: { id: 'host', name: 'H', avatarUrl: null },
    registrations: [],
    ...over,
  });
  const db = {
    club: {
      findMany: jest.fn().mockResolvedValue([clubRow()]),
      findUnique: jest.fn().mockResolvedValue(clubRow()),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockImplementation(({ data }: { data: object }) => clubRow(data)),
      delete: jest.fn().mockResolvedValue({}),
    },
  };
  return {
    db,
    service: new ClubsService(db as unknown as PrismaService),
    clubRow,
  };
}

const payload = {
  name: 'Chess',
  description: '',
  location: '',
  startDate: future.toISOString(),
  maxMembers: 5,
};

describe('ClubsService.getAll', () => {
  it('lists everything by default, capped', async () => {
    const { service, db } = setup();
    await service.getAll();
    expect(db.club.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {}, take: 100 }),
    );
  });

  it('filters out clubs that already started when upcoming=true', async () => {
    const { service, db } = setup();
    await service.getAll(undefined, { upcoming: true });
    const { where } = (db.club.findMany.mock.calls as unknown[][])[0][0] as {
      where: { startDate: { gt: Date } };
    };
    expect(where.startDate.gt).toBeInstanceOf(Date);
  });
});

describe('ClubsService.getOne', () => {
  it('404s for an unknown club', async () => {
    const { service, db } = setup();
    db.club.findUnique.mockResolvedValue(null);
    await expect(service.getOne('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('ClubsService.create', () => {
  it('creates a club with a two-hour end time', async () => {
    const { service, db } = setup();
    await service.create('host', payload);
    const { data } = (db.club.create.mock.calls as unknown[][])[0][0] as {
      data: { startDate: Date; endDate: Date; hostId: string };
    };
    expect(data.endDate.getTime() - data.startDate.getTime()).toBe(7_200_000);
    expect(data.hostId).toBe('host');
  });

  it('refuses a second upcoming club for the same host', async () => {
    const { service, db } = setup();
    db.club.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(service.create('host', payload)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(db.club.create).not.toHaveBeenCalled();
  });
});

describe('ClubsService.remove', () => {
  it('only lets the host delete', async () => {
    const { service, db } = setup();
    await expect(service.remove('c1', 'intruder')).rejects.toMatchObject({
      status: 403,
    });
    await service.remove('c1', 'host');
    expect(db.club.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
  });
});
