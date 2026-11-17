import type { Event } from "@/entities/event";

/**
 * What the viewer can do on the event detail screen:
 * - `edit`: organizer actions (Edit / Publish a draft / Cancel event)
 * - `request`: request to join
 * - `pending`: request sent, waiting for the organizer; may withdraw it
 * - `cancel-request`: approved; may cancel participation
 * - `full`: no spots left
 * - `closed`: the event is cancelled or completed, has ended (completion is
 *   lazy on the server, so a stored PUBLISHED may be stale), or has started
 *   and the viewer has not joined
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

export function getEventAction(
  event: Event,
  viewerId: string | null | undefined,
  now: Date = new Date(),
): EventAction {
  if (event.status === "CANCELLED" || event.status === "COMPLETED") return "closed";
  if (Date.parse(event.endsAt) <= now.getTime()) return "closed";
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
  if (Date.parse(event.startsAt) <= now.getTime()) return "closed";
  return event.spotsLeft > 0 ? "request" : "full";
}

/** Label for the `closed` action: why the event no longer takes requests. */
export function getClosedLabel(event: Event, now: Date = new Date()): string {
  if (event.status === "CANCELLED") return "Event cancelled";
  if (event.status === "COMPLETED" || Date.parse(event.endsAt) <= now.getTime()) {
    return "Event completed";
  }
  return "Event has started";
}
