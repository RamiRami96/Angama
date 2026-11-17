import { BadRequestException } from '@nestjs/common';
import type { z } from 'zod';
import {
  boardGamesDetailsSchema,
  speakingClubDetailsSchema,
  type EventCategoryCode,
} from '../../contracts';

/**
 * Category-specific `details` schemas. Adding a category = adding its schema
 * here (plus the contract and the seeded `EventCategory` row).
 */
const DETAILS_SCHEMAS: Record<EventCategoryCode, z.ZodType> = {
  SPEAKING_CLUB: speakingClubDetailsSchema,
  BOARD_GAMES: boardGamesDetailsSchema,
};

/** Validates `details` for `category`; 400 on an unknown category or bad data. */
export function parseEventDetails(
  category: EventCategoryCode,
  details: unknown,
): Record<string, unknown> {
  const schema = Object.hasOwn(DETAILS_SCHEMAS, category)
    ? DETAILS_SCHEMAS[category]
    : undefined;
  if (!schema) throw new BadRequestException('Unknown event category');

  const result = schema.safeParse(details);
  if (!result.success) {
    throw new BadRequestException(
      result.error.issues
        .map((i) =>
          i.path.length
            ? `details.${i.path.join('.')}: ${i.message}`
            : `details: ${i.message}`,
        )
        .join('; '),
    );
  }
  return result.data as Record<string, unknown>;
}
