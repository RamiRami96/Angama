import type { Event } from "@/entities/event";

/**
 * What the viewer can do on the event detail screen:
 * - `edit`: organizer actions (Edit / Publish a draft / Cancel event)
 * - `request`: request to join
 * - `pending`: request sent, waiting for the organizer
 * - `cancel-request`: approved; may cancel participation
 * - `full`: no spots left
 * - `closed`: the event is cancelled or completed
 * - `none`: nothing to do (rejected / cancelled participation cannot re-request)
 */
export type EventAction =
  | "edit"
  | "request"
  | "cancel-request"
  | "pending"
  | "full"
  | "closed"
  | "none";

export function getEventAction(event: Event, viewerId: string | null | undefined): EventAction {
  if (event.status === "CANCELLED" || event.status === "COMPLETED") return "closed";
  if (viewerId && event.organizer.id === viewerId) return "edit";

  switch (event.myParticipation) {
    case "REQUESTED":
      return "pending";
    case "APPROVED":
      return "cancel-request";
    case null:
      break;
    default:
      return "none";
  }

  if (event.status !== "PUBLISHED") return "none";
  return event.spotsLeft > 0 ? "request" : "full";
}
