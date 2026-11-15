import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => {
  const actual = jest.requireActual<typeof import('bcrypt')>('bcrypt');
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return { ...actual, compare: jest.fn(actual.compare) };
});

function setup(user: { id: string; password: string } | null) {
  const db = { user: { findUnique: jest.fn().mockResolvedValue(user) } };
  return new AuthService(db as unknown as PrismaService);
}

describe('AuthService.signIn', () => {
  const full = (password: string) => ({
    id: 'u1',
    name: 'N',
    email: 'a@b.c',
    password,
    dateOfBirth: new Date('2000-01-01'),
    avatarUrl: null,
    createdAt: new Date(),
  });

  it('signs in with the right password', async () => {
    const service = setup(full(await bcrypt.hash('correct-horse', 4)));
    await expect(
      service.signIn('a@b.c', 'correct-horse'),
    ).resolves.toMatchObject({ id: 'u1' });
  });

  it('rejects a wrong password', async () => {
    const service = setup(full(await bcrypt.hash('correct-horse', 4)));
    await expect(service.signIn('a@b.c', 'nope')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('still runs a bcrypt comparison for unknown emails (no timing oracle)', async () => {
    const compare = jest.mocked(bcrypt.compare);
    compare.mockClear();
    const service = setup(null);

    await expect(service.signIn('ghost@b.c', 'whatever')).rejects.toThrow(
      'Invalid email or password',
    );

    expect(compare).toHaveBeenCalledTimes(1);
    // The equaliser must be a well-formed hash, or bcrypt would return instantly.
    const hash = String(compare.mock.calls[0][1]);
    expect(hash).toMatch(/^\$2[aby]\$10\$/);
  });
});

describe('AuthService.signUp', () => {
  const dto = {
    name: 'Bob',
    email: 'b@b.co',
    password: 'password1',
    dateOfBirth: '2000-01-02',
  };

  it('rejects an email that is already registered', async () => {
    const db = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'x' }),
        create: jest.fn(),
      },
    };
    const service = new AuthService(db as unknown as PrismaService);
    await expect(service.signUp(dto)).rejects.toMatchObject({ status: 409 });
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it('stores a bcrypt hash, never the plain password', async () => {
    const db = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }: { data: object }) => ({
          id: 'u1',
          avatarUrl: null,
          createdAt: new Date(),
          ...data,
        })),
      },
    };
    const service = new AuthService(db as unknown as PrismaService);

    const user = await service.signUp(dto);

    const { data } = (db.user.create.mock.calls as unknown[][])[0][0] as {
      data: { password: string };
    };
    expect(data.password).not.toBe(dto.password);
    expect(data.password).toMatch(/^\$2[aby]\$10\$/);
    expect(user).not.toHaveProperty('password');
    expect(user.dateOfBirth).toBe('2000-01-02');
  });
});
