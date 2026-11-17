import { z } from "zod";

/** Mirrors the server's `ParticipationStatus` enum. */
export const participationStatusSchema = z.enum([
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "ATTENDED",
  "NO_SHOW",
]);

export type ParticipationStatus = z.infer<typeof participationStatusSchema>;
