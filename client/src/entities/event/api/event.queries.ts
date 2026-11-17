import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { Event } from "../model/event.model";
import { eventsService, normalizeEventFilters, type EventFilters } from "./event.service";

export function useEventsQuery(filters: EventFilters = {}) {
  // Key and URL come from the same normalized filters.
  const normalized = normalizeEventFilters(filters);
  return useQuery({
    queryKey: queryKeys.events.list(normalized),
    queryFn: () => eventsService.getAll(normalized),
    // Keep showing the previous results while a new filter combination loads.
    placeholderData: keepPreviousData,
  });
}

export function useEventQuery(id: string) {
  const queryClient = useQueryClient();

  // Seed the detail from any cached list that already contains this event.
  const fromLists = () => {
    for (const [key, list] of queryClient.getQueriesData<Event[]>({
      queryKey: queryKeys.events.lists,
    })) {
      const event = list?.find((e) => e.id === id);
      if (event) return { event, key };
    }
    return undefined;
  };

  return useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: () => eventsService.getOne(id),
    enabled: !!id,
    initialData: () => fromLists()?.event,
    initialDataUpdatedAt: () => {
      const hit = fromLists();
      return hit ? queryClient.getQueryState(hit.key)?.dataUpdatedAt : undefined;
    },
  });
}
