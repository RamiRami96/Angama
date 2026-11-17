import { eventSchema, type Event } from "@/entities/event";
import { requestParsed } from "@/shared/api";
import type { UpdateEventDto } from "@/shared/contracts";

export function updateEvent(id: string, data: UpdateEventDto): Promise<Event> {
  return requestParsed(`/events/${id}`, eventSchema, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
