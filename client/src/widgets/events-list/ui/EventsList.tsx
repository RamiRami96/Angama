import { useRouter } from "expo-router";

import { useEventFilters } from "../model/useEventFilters";
import { useEvents } from "../model/useEvents";

import { Events } from "./Events";

export function EventsList() {
  const router = useRouter();
  const filters = useEventFilters();
  const { events, isLoading, isRefetching, refetch } = useEvents(filters.filters);

  return (
    <Events
      events={events}
      filters={filters}
      loading={isLoading}
      onPressEvent={(id) => router.push(`/events/${id}`)}
      onCreateEvent={() => router.push("/events/create")}
      refreshing={isRefetching}
      onRefresh={refetch}
    />
  );
}
