import { useEventsQuery, type Event } from "@/entities/event";

// Stable reference, so memoized consumers (search) don't recompute while loading.
const NO_EVENTS: Event[] = [];

export function useEvents() {
  const { data, isRefetching, refetch } = useEventsQuery();

  // The server returns only upcoming published events (plus the viewer's drafts).
  return { events: data ?? NO_EVENTS, isRefetching, refetch };
}
