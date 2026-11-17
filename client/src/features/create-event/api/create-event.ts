import { eventSchema, type Event } from "@/entities/event";
import { requestParsed } from "@/shared/api";

import type { CreateEventData } from "../model/create-event.model";

export function createEvent(data: CreateEventData): Promise<Event> {
  return requestParsed("/events", eventSchema, { method: "POST", body: JSON.stringify(data) });
}
