import { BadRequestException } from '@nestjs/common';
import {
  createClubSchema,
  signInSchema,
  signUpSchema,
  updateProfileSchema,
} from '../../contracts';
import { parseEnv } from '../../config/env';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  it('returns parsed data (normalised, unknown keys stripped)', () => {
    const pipe = new ZodValidationPipe(signInSchema);
    expect(
      pipe.transform({ email: 'A@B.com', password: 'x', isAdmin: true }),
    ).toEqual({ email: 'a@b.com', password: 'x' });
  });

  it('throws 400 with a readable message and per-field errors', () => {
    const pipe = new ZodValidationPipe(signUpSchema);
    try {
      pipe.transform({
        name: 'A',
        email: 'nope',
        password: '1',
        dateOfBirth: 'x',
      });
      throw new Error('should throw');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      const body = (e as BadRequestException).getResponse() as {
        message: string;
        errors: { path: string }[];
      };
      expect(typeof body.message).toBe('string');
      expect(body.errors.map((x) => x.path).sort()).toEqual([
        'dateOfBirth',
        'email',
        'name',
        'password',
      ]);
    }
  });

  it('rejects missing body', () => {
    expect(() =>
      new ZodValidationPipe(signInSchema).transform(undefined),
    ).toThrow(BadRequestException);
  });
});

describe('schemas', () => {
  it('createClub requires ISO startDate and integer maxMembers >= 1', () => {
    const ok = {
      name: 'n',
      description: '',
      location: '',
      startDate: new Date().toISOString(),
      maxMembers: 5,
    };
    expect(createClubSchema.safeParse(ok).success).toBe(true);
    expect(createClubSchema.safeParse({ ...ok, maxMembers: 0 }).success).toBe(
      false,
    );
    expect(createClubSchema.safeParse({ ...ok, maxMembers: '5' }).success).toBe(
      false,
    );
    expect(
      createClubSchema.safeParse({ ...ok, startDate: 'tomorrow' }).success,
    ).toBe(false);
  });

  it('updateProfile only allows name/avatarUrl', () => {
    expect(updateProfileSchema.parse({ name: 'Bob', id: 'x' })).toEqual({
      name: 'Bob',
    });
    expect(
      updateProfileSchema.safeParse({ avatarUrl: 'not a url' }).success,
    ).toBe(false);
  });
});

describe('parseEnv', () => {
  const base = {
    JWT_ACCESS_SECRET: 'a',
    JWT_REFRESH_SECRET: 'b',
    DATABASE_URL: 'd',
  };
  it('applies defaults', () => expect(parseEnv(base).PORT).toBe(3000));
  it('throws naming the missing variable', () =>
    expect(() => parseEnv({ ...base, JWT_ACCESS_SECRET: '' })).toThrow(
      /JWT_ACCESS_SECRET/,
    ));
});
