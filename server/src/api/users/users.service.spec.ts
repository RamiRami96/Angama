import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService.updateProfile', () => {
  const user = {
    id: 'u1',
    name: 'Bob',
    email: 'b@b.co',
    password: 'hash',
    avatarUrl: null,
    city: 'Berlin',
    about: null,
    dateOfBirth: new Date('2000-01-02'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
  };

  it('returns the public user shape and never the password', async () => {
    const update = jest.fn().mockResolvedValue(user);
    const service = new UsersService({
      user: { update },
    } as unknown as PrismaService);

    const result = await service.updateProfile('u1', { name: 'Bob' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { name: 'Bob' },
    });
    expect(result).toEqual({
      id: 'u1',
      name: 'Bob',
      email: 'b@b.co',
      avatarUrl: null,
      city: 'Berlin',
      about: null,
      dateOfBirth: '2000-01-02',
      createdAt: '2024-01-01T00:00:00.000Z',
    });
    expect(result).not.toHaveProperty('password');
  });

  it('passes null through so the avatar can be removed', async () => {
    const update = jest.fn().mockResolvedValue(user);
    const service = new UsersService({
      user: { update },
    } as unknown as PrismaService);
    await service.updateProfile('u1', { avatarUrl: null });
    expect(update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { avatarUrl: null },
    });
  });

  it('accepts city and about', async () => {
    const update = jest
      .fn()
      .mockResolvedValue({ ...user, city: 'Paris', about: 'Hi' });
    const service = new UsersService({
      user: { update },
    } as unknown as PrismaService);

    const result = await service.updateProfile('u1', {
      city: 'Paris',
      about: 'Hi',
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { city: 'Paris', about: 'Hi' },
    });
    expect(result).toMatchObject({ city: 'Paris', about: 'Hi' });
  });
});

describe('UsersService preferences and languages', () => {
  function setup(
    opts: {
      prefs?: { id: string; type: string; code: string }[];
      langs?: { id: string; code: string }[];
      userPrefs?: { preference: { type: string; code: string } }[];
      userLangs?: { level: string; language: { code: string } }[];
    } = {},
  ) {
    const calls: string[] = [];
    const db = {
      preference: {
        findMany: jest.fn().mockResolvedValue(opts.prefs ?? []),
      },
      language: { findMany: jest.fn().mockResolvedValue(opts.langs ?? []) },
      userPreference: {
        findMany: jest.fn().mockResolvedValue(opts.userPrefs ?? []),
        deleteMany: jest.fn(() => {
          calls.push('userPreference.deleteMany');
          return Promise.resolve({ count: 0 });
        }),
        createMany: jest.fn(() => {
          calls.push('userPreference.createMany');
          return Promise.resolve({ count: 0 });
        }),
      },
      userLanguage: {
        findMany: jest.fn().mockResolvedValue(opts.userLangs ?? []),
        deleteMany: jest.fn(() => {
          calls.push('userLanguage.deleteMany');
          return Promise.resolve({ count: 0 });
        }),
        createMany: jest.fn(() => {
          calls.push('userLanguage.createMany');
          return Promise.resolve({ count: 0 });
        }),
      },
      $transaction: jest.fn(async (ops: Promise<unknown>[]) => {
        calls.push('$transaction');
        return Promise.all(ops);
      }),
    };
    const service = new UsersService(db as unknown as PrismaService);
    return { db, service, calls };
  }

  describe('getPreferences', () => {
    it('groups goals and interests by type and lists languages with level', async () => {
      const { service, db } = setup({
        userPrefs: [
          { preference: { type: 'GOAL', code: 'FIND_FRIENDS' } },
          { preference: { type: 'INTEREST', code: 'SPORTS' } },
          { preference: { type: 'INTEREST', code: 'CULTURE' } },
        ],
        userLangs: [{ level: 'B2', language: { code: 'en' } }],
      });

      await expect(service.getPreferences('u1')).resolves.toEqual({
        goals: ['FIND_FRIENDS'],
        interests: ['SPORTS', 'CULTURE'],
        languages: [{ code: 'en', level: 'B2' }],
      });
      expect(db.userPreference.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1' } }),
      );
    });
  });

  describe('setPreferences', () => {
    const prefs = [
      { id: 'p1', type: 'GOAL', code: 'FIND_FRIENDS' },
      { id: 'p2', type: 'INTEREST', code: 'SPORTS' },
    ];

    it('resolves codes, then replaces all rows in a transaction', async () => {
      const { service, db, calls } = setup({
        prefs,
        userPrefs: prefs.map((p) => ({ preference: p })),
      });

      const result = await service.setPreferences('u1', {
        goals: ['FIND_FRIENDS'],
        interests: ['SPORTS'],
      });

      expect(db.preference.findMany).toHaveBeenCalledTimes(1);
      expect(db.userPreference.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
      expect(db.userPreference.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 'u1', preferenceId: 'p1' },
          { userId: 'u1', preferenceId: 'p2' },
        ],
      });
      expect(db.$transaction).toHaveBeenCalledTimes(1);
      expect(calls.indexOf('userPreference.deleteMany')).toBeLessThan(
        calls.indexOf('userPreference.createMany'),
      );
      expect(result).toEqual({
        goals: ['FIND_FRIENDS'],
        interests: ['SPORTS'],
        languages: [],
      });
    });

    it('rejects unknown codes without touching the user rows', async () => {
      const { service, db } = setup({ prefs: [prefs[0]] });

      await expect(
        service.setPreferences('u1', {
          goals: ['FIND_FRIENDS'],
          interests: ['SPORTS'],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(db.$transaction).not.toHaveBeenCalled();
      expect(db.userPreference.deleteMany).not.toHaveBeenCalled();
    });

    it('clears everything when both lists are empty', async () => {
      const { service, db } = setup();

      await service.setPreferences('u1', { goals: [], interests: [] });

      expect(db.userPreference.deleteMany).toHaveBeenCalled();
      expect(db.userPreference.createMany).toHaveBeenCalledWith({ data: [] });
    });
  });

  describe('setLanguages', () => {
    it('lowercases codes, then replaces all rows in a transaction', async () => {
      const { service, db, calls } = setup({
        langs: [{ id: 'l1', code: 'en' }],
        userLangs: [{ level: 'B2', language: { code: 'en' } }],
      });

      const result = await service.setLanguages('u1', {
        languages: [{ code: 'EN', level: 'B2' }],
      });

      expect(db.language.findMany).toHaveBeenCalledWith({
        where: { code: { in: ['en'] } },
      });
      expect(db.userLanguage.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
      expect(db.userLanguage.createMany).toHaveBeenCalledWith({
        data: [{ userId: 'u1', languageId: 'l1', level: 'B2' }],
      });
      expect(db.$transaction).toHaveBeenCalledTimes(1);
      expect(calls.indexOf('userLanguage.deleteMany')).toBeLessThan(
        calls.indexOf('userLanguage.createMany'),
      );
      expect(result.languages).toEqual([{ code: 'en', level: 'B2' }]);
    });

    it('rejects an unknown language code', async () => {
      const { service, db } = setup({ langs: [] });

      await expect(
        service.setLanguages('u1', {
          languages: [{ code: 'xx', level: 'A1' }],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(db.$transaction).not.toHaveBeenCalled();
    });

    it('rejects codes that collide after lowercasing', async () => {
      const { service, db } = setup({ langs: [{ id: 'l1', code: 'en' }] });

      await expect(
        service.setLanguages('u1', {
          languages: [
            { code: 'en', level: 'A1' },
            { code: 'EN', level: 'B1' },
          ],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(db.$transaction).not.toHaveBeenCalled();
    });
  });
});
