import { z } from "zod";

import { eventSchema } from "@/entities/event";

import { participationStatusSchema } from "./participation-status";

export { participationStatusSchema, type ParticipationStatus } from "./participation-status";

const avatarUrl = z
  .string()
  .nullish()
  .transform((v) => v ?? undefined);

/** GET /events/:id/participants item (the organizer's view). */
export const participantSchema = z.object({
  userId: z.string(),
  eventId: z.string(),
  status: participationStatusSchema,
  createdAt: z.string(),
  user: z.object({ id: z.string(), name: z.string(), avatarUrl }),
});

/** GET /users/me/events?role=organizer item. */
export const myOrganizedEventSchema = z.object({
  event: eventSchema,
  participantCount: z.number(),
  pendingCount: z.number(),
});

/** GET /users/me/events?role=participant item. */
export const myParticipationSchema = z.object({
  event: eventSchema,
  participationStatus: participationStatusSchema,
});

export type Participant = z.infer<typeof participantSchema>;
export type MyOrganizedEvent = z.infer<typeof myOrganizedEventSchema>;
export type MyParticipation = z.infer<typeof myParticipationSchema>;
