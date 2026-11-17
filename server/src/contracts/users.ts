import { z } from 'zod';

export const GOAL_CODES = [
  'PRACTICE_LANGUAGES',
  'FIND_FRIENDS',
  'MEET_INTERNATIONAL_PEOPLE',
  'LEARN_SOMETHING_NEW',
  'EXPAND_SOCIAL_CIRCLES',
] as const;

export const INTEREST_CODES = [
  'ENGLISH',
  'OTHER_LANGUAGES',
  'BOARD_GAMES',
  'TRAVELING',
  'SPORTS',
  'TECHNOLOGY',
  'CULTURE',
  'EDUCATION',
] as const;

export const LANGUAGE_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export type GoalCode = (typeof GOAL_CODES)[number];
export type InterestCode = (typeof INTEREST_CODES)[number];
export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];

export const languageLevelSchema = z.enum(LANGUAGE_LEVELS);

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .optional(),
  city: z.string().trim().min(1, 'City is required').optional(),
  about: z
    .string()
    .trim()
    .max(1000, 'About must be at most 1000 characters')
    .nullable()
    .optional(),
  // http(s) only (no javascript:, data: ...). `null` removes the avatar.
  avatarUrl: z
    .url({ protocol: /^https?$/, error: 'Invalid avatar URL' })
    .nullable()
    .optional(),
});

const unique = <T>(items: T[]): T[] => [...new Set(items)];

/** PUT /users/me/preferences. Replaces both lists; duplicates are collapsed. */
export const updatePreferencesSchema = z.object({
  goals: z.array(z.enum(GOAL_CODES)).transform(unique),
  interests: z.array(z.enum(INTEREST_CODES)).transform(unique),
});

/** PUT /users/me/languages. Replaces the list; codes must be unique. */
export const updateLanguagesSchema = z.object({
  languages: z
    .array(
      z.object({
        code: z.string().trim().min(1, 'Language code is required'),
        level: languageLevelSchema,
      }),
    )
    .max(20, 'At most 20 languages')
    .refine(
      (items) => new Set(items.map((l) => l.code)).size === items.length,
      {
        error: 'Duplicate language codes',
      },
    ),
});

/** GET /users/me/events query string. */
export const myEventsQuerySchema = z.object({
  role: z.enum(['organizer', 'participant']),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UpdatePreferencesDto = z.infer<typeof updatePreferencesSchema>;
export type UpdateLanguagesDto = z.infer<typeof updateLanguagesSchema>;
export type MyEventsQuery = z.infer<typeof myEventsQuerySchema>;
