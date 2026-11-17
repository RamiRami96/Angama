import { z } from "zod";

import { participationStatusSchema } from "@/entities/participation/@x/event";
import { EVENT_CATEGORY_CODES } from "@/shared/contracts";

const avatarUrl = z
  .string()
  .nullish()
  .transform((v) => v ?? undefined);

export const eventStatusSchema = z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]);

/** Mirrors the server's `EventDto` (events.mapper.ts `toEventDto`). */
export const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.object({ code: z.enum(EVENT_CATEGORY_CODES), name: z.string() }),
  details: z.record(z.string(), z.unknown()),
  coverImageUrl: z.string().nullable(),
  startsAt: z.string(),
  endsAt: z.string(),
  city: z.string(),
  address: z.string(),
  maxParticipants: z.number(),
  participantCount: z.number(),
  spotsLeft: z.number(),
  price: z.number().nullable(),
  language: z.object({ code: z.string(), name: z.string() }),
  status: eventStatusSchema,
  organizer: z.object({ id: z.string(), name: z.string(), avatarUrl }),
  /** The viewer's participation status; null when signed out or not participating. */
  myParticipation: participationStatusSchema.nullable(),
  createdAt: z.string(),
});

export const eventListSchema = z.array(eventSchema);

export type Event = z.infer<typeof eventSchema>;
export type EventStatus = z.infer<typeof eventStatusSchema>;
