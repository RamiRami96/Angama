import type { EventStatus } from "./event.model";

export const EVENT_STATUS_STYLE: Record<EventStatus, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "bg-white/10", text: "text-white/60", label: "Draft" },
  PUBLISHED: { bg: "bg-green-500/20", text: "text-green-300", label: "Published" },
  CANCELLED: { bg: "bg-red-500/20", text: "text-red-300", label: "Cancelled" },
  COMPLETED: { bg: "bg-white/10", text: "text-white/40", label: "Completed" },
};
