import { useEventsQuery, type Event, type EventFilters } from "@/entities/event";

// Stable reference for the empty state while loading.
const NO_EVENTS: Event[] = [];

export function useEvents(filters: EventFilters) {
  const { data, isLoading, isRefetching, isPlaceholderData, refetch } = useEventsQuery(filters);

  // The server returns only upcoming published events matching the filters.
  return {
    events: data ?? NO_EVENTS,
    isLoading,
    // A filter change shows the previous results as placeholder; not a pull-to-refresh.
    isRefetching: isRefetching && !isPlaceholderData,
    refetch,
  };
}
