import type { Event } from "@/entities/event";

const EXPERIENCE_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);

/** Category-specific detail rows (label/value), skipping unset values. */
export function getCategoryDetailRows(event: Pick<Event, "category" | "details">) {
  const d = event.details;
  const experience = text(d.experienceLevel);
  const rows =
    event.category.code === "BOARD_GAMES"
      ? [
          { label: "Game", value: text(d.game) },
          { label: "Experience level", value: experience && (EXPERIENCE_LABELS[experience] ?? experience) },
        ]
      : [
          { label: "Topic", value: text(d.topic) },
          { label: "Level", value: text(d.level) },
        ];
  return rows.filter((r): r is { label: string; value: string } => r.value !== undefined);
}

/** Informational price only — there is no payment in the app. */
export function formatPrice(price: number | null): string {
  return price === null || price === 0 ? "Free" : String(Number(price.toFixed(2)));
}
