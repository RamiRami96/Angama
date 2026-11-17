import { requestParsed } from "@/shared/api";

import { Event, eventListSchema, eventSchema } from "../model/event.model";

export const eventsService = {
  // Discovery filters (query string) arrive in Task 10 (`buildEventsQuery`).
  getAll: (): Promise<Event[]> => requestParsed("/events", eventListSchema),

  getOne: (id: string): Promise<Event> => requestParsed(`/events/${id}`, eventSchema),
};
