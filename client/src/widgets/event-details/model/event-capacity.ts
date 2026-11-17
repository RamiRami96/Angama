import type { Event } from "@/entities/event";

export function getEventCapacity(event: Event) {
  return {
    fillRatio: event.maxParticipants > 0 ? event.participantCount / event.maxParticipants : 0,
    spotsLeft: event.spotsLeft,
  };
}
