import { requestParsed } from "@/shared/api";
import type { ListEventsQuery } from "@/shared/contracts";

import { Event, eventListSchema, eventSchema } from "../model/event.model";

/** Discovery filters of `GET /events`. */
export type EventFilters = ListEventsQuery;

/** Fixed order, so equal filters always produce the same URL. */
const FILTER_KEYS = ["q", "category", "language", "city", "date"] as const;

/**
 * Trims every filter and drops blank ones. The query key and the URL are both
 * derived from this result, so they can never diverge.
 */
export function normalizeEventFilters(filters: EventFilters = {}): EventFilters {
  const out: Record<string, string> = {};
  for (const key of FILTER_KEYS) {
    const value = filters[key]?.trim();
    if (value) out[key] = value;
  }
  return out as EventFilters;
}

/** `/events` plus the set filters, URL-encoded (`/events?q=chess%20club&city=Berlin`). */
export function buildEventsQuery(filters: EventFilters = {}): string {
  const normalized = normalizeEventFilters(filters);
  const params = FILTER_KEYS.filter((key) => normalized[key] !== undefined).map(
    (key) => `${key}=${encodeURIComponent(normalized[key] as string)}`,
  );
  return params.length ? `/events?${params.join("&")}` : "/events";
}

export const eventsService = {
  getAll: (filters: EventFilters = {}): Promise<Event[]> =>
    requestParsed(buildEventsQuery(filters), eventListSchema),

  getOne: (id: string): Promise<Event> => requestParsed(`/events/${id}`, eventSchema),
};
