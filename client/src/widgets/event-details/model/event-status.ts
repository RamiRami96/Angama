import { EVENT_STATUS_STYLE, type Event } from "@/entities/event";

// Interim (Task 8): Task 10 replaces this with `getEventAction`.
export function getEventStatus(event: Event) {
  const hasParticipation = event.myParticipation !== null;
  const isOpen = event.status === "PUBLISHED";
  const canRequest = !hasParticipation && isOpen && event.spotsLeft > 0;

  let requestLabel = "Request to Join";
  if (hasParticipation) requestLabel = "Already Requested";
  else if (!isOpen) requestLabel = EVENT_STATUS_STYLE[event.status].label;
  else if (event.spotsLeft <= 0) requestLabel = "Event is Full";

  return { status: EVENT_STATUS_STYLE[event.status], canRequest, requestLabel };
}
