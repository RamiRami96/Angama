import { z } from 'zod';
import { languageLevelSchema } from './users';

export const EVENT_CATEGORY_CODES = ['SPEAKING_CLUB', 'BOARD_GAMES'] as const;
export const EXPERIENCE_LEVELS = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
] as const;

export type EventCategoryCode = (typeof EVENT_CATEGORY_CODES)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const speakingClubDetailsSchema = z.object({
  level: languageLevelSchema.optional(),
  topic: z.string().trim().min(1, 'Topic is required'),
});

export const boardGamesDetailsSchema = z.object({
  game: z.string().trim().min(1, 'Game is required'),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
});

export const eventBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(120, 'Name must be at most 120 characters'),
  description: z
    .string()
    .trim()
    .max(5000, 'Description must be at most 5000 characters'),
  category: z.enum(EVENT_CATEGORY_CODES),
  // http(s) only. `null` removes the cover.
  coverImageUrl: z
    .url({ protocol: /^https?$/, error: 'Invalid cover image URL' })
    .nullable()
    .optional(),
  startsAt: z.iso.datetime({ error: 'Invalid start date' }),
  endsAt: z.iso.datetime({ error: 'Invalid end date' }),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(100, 'City must be at most 100 characters'),
  address: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(300, 'Address must be at most 300 characters'),
  maxParticipants: z
    .number()
    .int('Max participants must be a whole number')
    .min(1, 'Max participants must be at least 1')
    .max(10_000, 'Max participants must be at most 10000'),
  // Fits the Decimal(10,2) column.
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(99_999_999.99, 'Price is too high')
    .nullable()
    .optional(),
  language: z.string().trim().min(1, 'Language is required'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
});

const endsAfterStarts = (v: { startsAt?: string; endsAt?: string }) =>
  v.startsAt === undefined ||
  v.endsAt === undefined ||
  Date.parse(v.endsAt) > Date.parse(v.startsAt);

const endsAfterStartsIssue = {
  error: 'End must be after start',
  path: ['endsAt'],
};

export const createEventSchema = z
  .discriminatedUnion('category', [
    eventBaseSchema.extend({
      category: z.literal('SPEAKING_CLUB'),
      details: speakingClubDetailsSchema,
    }),
    eventBaseSchema.extend({
      category: z.literal('BOARD_GAMES'),
      details: boardGamesDetailsSchema,
    }),
  ])
  .refine(endsAfterStarts, endsAfterStartsIssue);

/**
 * PATCH /events/:id. Category is not editable (an unknown `category` key is
 * stripped). `details` is the union of both categories' fields, all optional:
 * the service validates the merged result against the stored category.
 * `status` is re-declared without a default so an omitted status is not reset.
 */
export const updateEventSchema = eventBaseSchema
  .omit({ category: true, status: true })
  .partial()
  .extend({
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    details: speakingClubDetailsSchema
      .partial()
      .extend(boardGamesDetailsSchema.partial().shape)
      .optional(),
  })
  .refine(endsAfterStarts, endsAfterStartsIssue);

/** GET /events query string. */
export const listEventsQuerySchema = z.object({
  q: z.string().trim().optional(),
  category: z.enum(EVENT_CATEGORY_CODES).optional(),
  language: z.string().trim().optional(),
  city: z.string().trim().optional(),
  date: z.iso.date('Use format YYYY-MM-DD').optional(),
});

export type CreateEventDto = z.infer<typeof createEventSchema>;
export type UpdateEventDto = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
