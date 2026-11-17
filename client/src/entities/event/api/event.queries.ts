import { useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { Event } from "../model/event.model";
import { eventsService } from "./event.service";

export function useEventsQuery() {
  return useQuery({
    queryKey: queryKeys.events.list(),
    queryFn: eventsService.getAll,
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
