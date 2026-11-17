import { z } from "zod";

import { createEventSchema, type CreateEventDto } from "@/shared/contracts";

/**
 * Interim form (Task 8): Speaking Club only, no price/cover/draft. Task 10
 * replaces it with the full form (category selector, per-category details).
 */
export type CreateEventFields = {
  name: string;
  description: string;
  topic: string;
  city: string;
  address: string;
  language: string;
  startsAt: string;
  endsAt: string;
  maxParticipants: string;
};

const isValidDate = (v: string) => !Number.isNaN(new Date(v).getTime());

const dateField = (requiredMessage: string) =>
  z
    .string()
    .min(1, requiredMessage)
    .refine(isValidDate, "Invalid date")
    .transform((v) => new Date(v).toISOString());

/**
 * Form strings -> API payload. Field rules (required name, minimum capacity,
 * end after start, ...) come from the shared contract; this layer only
 * converts the raw input.
 */
export const createEventFormSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    topic: z.string(),
    city: z.string(),
    address: z.string(),
    language: z.string(),
    startsAt: dateField("Pick a start date"),
    endsAt: dateField("Pick an end date"),
    maxParticipants: z
      .string()
      .trim()
      .regex(/^\d+$/, "Enter a whole number")
      .transform(Number),
  })
  .transform(
    ({ topic, ...rest }): z.input<typeof createEventSchema> => ({
      ...rest,
      category: "SPEAKING_CLUB",
      details: { topic },
    }),
  )
  .pipe(createEventSchema);

export type CreateEventData = CreateEventDto;
export type CreateEventErrors = Partial<Record<keyof CreateEventFields, string>>;

/** Maps an issue path to the form field it belongs to (`details.topic` -> `topic`). */
export function fieldOfIssue(path: PropertyKey[]): keyof CreateEventFields {
  return (path[0] === "details" ? path[1] : path[0]) as keyof CreateEventFields;
}
