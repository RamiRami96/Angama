import { z } from 'zod';

const envSchema = z.object({
  JWT_ACCESS_SECRET: z.string().min(1, 'is not set'),
  JWT_REFRESH_SECRET: z.string().min(1, 'is not set'),
  DATABASE_URL: z.string().min(1, 'is not set'),
  DIRECT_URL: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
  /** Number of reverse-proxy hops in front of the app (so req.ip is the real client). */
  TRUST_PROXY: z.coerce.number().int().min(0).optional(),
  COOKIE_SAMESITE: z
    .string()
    .toLowerCase()
    .pipe(z.enum(['lax', 'strict', 'none']))
    .optional(),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (result.success) return result.data;

  const details = result.error.issues
    .map((i) => `${i.path.join('.')} ${i.message}`)
    .join(', ');
  throw new Error(`Invalid environment: ${details}`);
}
