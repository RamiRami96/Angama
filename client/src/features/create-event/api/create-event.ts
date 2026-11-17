import { eventSchema, type Event } from "@/entities/event";
import { requestParsed } from "@/shared/api";
import type { CreateEventDto } from "@/shared/contracts";

export function createEvent(data: CreateEventDto): Promise<Event> {
  return requestParsed("/events", eventSchema, { method: "POST", body: JSON.stringify(data) });
}
