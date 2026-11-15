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
