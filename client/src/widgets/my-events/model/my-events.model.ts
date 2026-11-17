import { EVENT_STATUS_STYLE, type EventStatus } from "@/entities/event";
import type { MyOrganizedEvent } from "@/entities/participation";

/** Display labels for an "Organized by Me" item. */
export function describeOrganizedEvent(item: MyOrganizedEvent): {
  statusLabel: string;
  capacityLabel: string;
  pendingLabel: string | null;
} {
  return {
    statusLabel: EVENT_STATUS_STYLE[item.event.status].label,
    capacityLabel: `${item.participantCount}/${item.event.maxParticipants}`,
    pendingLabel: item.pendingCount > 0 ? `${item.pendingCount} pending` : null,
  };
}

/** Edit / Cancel are offered only while the event is still open. */
export function canManageEvent(status: EventStatus): boolean {
  return status === "DRAFT" || status === "PUBLISHED";
}
