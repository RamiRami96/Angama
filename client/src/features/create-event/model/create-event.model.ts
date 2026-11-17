import { z } from "zod";

import type { Event } from "@/entities/event";
import {
  createEventSchema,
  type CreateEventDto,
  type EventCategoryCode,
} from "@/shared/contracts";

/** Raw form state: every input is a string; `category` picks the detail fields. */
export type EventFormFields = {
  category: EventCategoryCode;
  name: string;
  description: string;
  coverImageUrl: string;
  city: string;
  address: string;
  language: string;
  /** Local date-time, `YYYY-MM-DDTHH:mm`. */
  startsAt: string;
  endsAt: string;
  maxParticipants: string;
  price: string;
  // Speaking club
  topic: string;
  level: string;
  // Board games
  game: string;
  experienceLevel: string;
};

export type DetailFields = Pick<EventFormFields, "topic" | "level" | "game" | "experienceLevel">;

/** The category-specific `details` payload (validated by the shared contract). */
export function buildDetails(
  category: EventCategoryCode,
  fields: DetailFields,
): Record<string, string> {
  if (category === "BOARD_GAMES") {
    return { game: fields.game, experienceLevel: fields.experienceLevel };
  }
  return fields.level ? { topic: fields.topic, level: fields.level } : { topic: fields.topic };
}

const isValidDate = (v: string) => !Number.isNaN(new Date(v).getTime());

const dateField = (requiredMessage: string) =>
  z
    .string()
    .min(1, requiredMessage)
    .refine(isValidDate, "Invalid date")
    .transform((v) => new Date(v).toISOString());

const blankToUndefined = (v: string) => {
  const t = v.trim();
  return t === "" ? undefined : t;
};

/**
 * Form strings -> `CreateEventDto`. Field rules (required name, minimum
 * capacity, end after start, per-category details, ...) come from the shared
 * contract; this layer only converts the raw input.
 */
export const createEventFormSchema = z
  .object({
    category: z.enum(["SPEAKING_CLUB", "BOARD_GAMES"]),
    name: z.string(),
    description: z.string(),
    coverImageUrl: z.string().transform(blankToUndefined),
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
    price: z
      .string()
      .trim()
      .regex(/^(\d+(\.\d{1,2})?)?$/, "Enter a valid price")
      .transform((v) => (v === "" ? undefined : Number(v))),
    topic: z.string(),
    level: z.string(),
    game: z.string(),
    experienceLevel: z.string(),
  })
  .transform(
    ({ topic, level, game, experienceLevel, coverImageUrl, price, ...rest }) =>
      ({
        ...rest,
        ...(coverImageUrl !== undefined && { coverImageUrl }),
        ...(price !== undefined && { price }),
        details: buildDetails(rest.category, { topic, level, game, experienceLevel }),
      }) as z.input<typeof createEventSchema>,
  )
  .pipe(createEventSchema);

export type EventFormErrors = Partial<Record<keyof EventFormFields, string>>;

/** Maps an issue path to the form field it belongs to (`details.topic` -> `topic`). */
export function fieldOfIssue(path: PropertyKey[]): keyof EventFormFields {
  return (path[0] === "details" ? path[1] : path[0]) as keyof EventFormFields;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO instant -> local `YYYY-MM-DDTHH:mm` (the form's date-time format). */
export function toLocalDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

type EditableEvent = Pick<
  Event,
  | "category"
  | "name"
  | "description"
  | "coverImageUrl"
  | "city"
  | "address"
  | "language"
  | "startsAt"
  | "endsAt"
  | "maxParticipants"
  | "price"
  | "details"
>;

/** Initial form values for editing an existing event. */
export function eventToFormFields(event: EditableEvent): EventFormFields {
  return {
    category: event.category.code,
    name: event.name,
    description: event.description,
    coverImageUrl: event.coverImageUrl ?? "",
    city: event.city,
    address: event.address,
    language: event.language.code,
    startsAt: toLocalDateTime(new Date(event.startsAt)),
    endsAt: toLocalDateTime(new Date(event.endsAt)),
    maxParticipants: String(event.maxParticipants),
    price: event.price === null ? "" : String(event.price),
    topic: str(event.details.topic),
    level: str(event.details.level),
    game: str(event.details.game),
    experienceLevel: str(event.details.experienceLevel) || "BEGINNER",
  };
}

export type { CreateEventDto };
