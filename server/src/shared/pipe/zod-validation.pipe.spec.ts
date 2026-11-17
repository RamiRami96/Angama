import { BadRequestException } from '@nestjs/common';
import {
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
        city: '',
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
        'city',
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
  it('updateProfile only allows profile fields', () => {
    expect(updateProfileSchema.parse({ name: 'Bob', id: 'x' })).toEqual({
      name: 'Bob',
    });
    expect(
      updateProfileSchema.safeParse({ avatarUrl: 'not a url' }).success,
    ).toBe(false);
  });

  it('avatarUrl is http(s) only and can be null to clear it', () => {
    const ok = (avatarUrl: unknown) =>
      updateProfileSchema.safeParse({ avatarUrl }).success;
    expect(ok('https://cdn.example.com/a.png')).toBe(true);
    expect(ok(null)).toBe(true);
    expect(ok('javascript:alert(1)')).toBe(false);
    expect(ok('data:text/html;base64,AAAA')).toBe(false);
    expect(ok('ftp://example.com/a.png')).toBe(false);
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
