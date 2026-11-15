import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  dateOfBirth: z.string(),
  avatarUrl: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined),
  createdAt: z.string(),
});

export const authResponseSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
});

export const hostedClubRefSchema = z
  .object({ id: z.string() })
  .nullish()
  .transform((v) => v ?? null);

export type User = z.infer<typeof userSchema>;
