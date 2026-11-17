import { z } from "zod";

import { languageLevelSchema } from "@/shared/contracts";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  city: z.string(),
  about: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined),
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

export type User = z.infer<typeof userSchema>;

/** Mirrors GET/PUT /users/me/preferences: codes from GET /catalog. */
export const userPreferencesSchema = z.object({
  goals: z.array(z.string()),
  interests: z.array(z.string()),
  languages: z.array(z.object({ code: z.string(), level: languageLevelSchema })),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;
