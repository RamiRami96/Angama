import { eventSchema, type Event } from "@/entities/event";
import { requestParsed } from "@/shared/api";

export function publishEvent(id: string): Promise<Event> {
  return requestParsed(`/events/${id}/publish`, eventSchema, { method: "POST" });
}
