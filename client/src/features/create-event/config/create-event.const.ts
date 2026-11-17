import type { EventCategoryCode, ExperienceLevel } from "@/shared/contracts";

import type { EventFormFields } from "../model/create-event.model";

export const EMPTY_EVENT_FIELDS: EventFormFields = {
  category: "SPEAKING_CLUB",
  name: "",
  description: "",
  coverImageUrl: "",
  city: "",
  address: "",
  language: "",
  startsAt: "",
  endsAt: "",
  maxParticipants: "",
  price: "",
  topic: "",
  level: "",
  game: "",
  experienceLevel: "BEGINNER",
};

export const CATEGORY_OPTIONS: { code: EventCategoryCode; label: string }[] = [
  { code: "SPEAKING_CLUB", label: "Speaking Club" },
  { code: "BOARD_GAMES", label: "International Board Games" },
];

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};
