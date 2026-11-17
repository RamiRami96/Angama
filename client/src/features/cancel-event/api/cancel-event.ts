import { eventSchema, type Event } from "@/entities/event";
import { requestParsed } from "@/shared/api";

export function cancelEvent(id: string): Promise<Event> {
  return requestParsed(`/events/${id}/cancel`, eventSchema, { method: "POST" });
}
