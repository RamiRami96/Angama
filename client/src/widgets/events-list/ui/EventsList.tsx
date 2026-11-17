import { useRouter } from "expo-router";
import { Events } from "./Events";
import { useEvents } from "../model/useEvents";
import { useEventSearch } from "../model/useEventSearch";

export function EventsList() {
  const router = useRouter();
  const { events, isRefetching, refetch } = useEvents();

  const { searchQuery, setSearchQuery, filteredEvents } = useEventSearch(events);

  const handleCreateEvent = () => router.push("/events/create");

  const handlePressEvent = (id: string) => router.push(`/events/${id}`);

  return (
    <Events
      events={filteredEvents}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onPressEvent={handlePressEvent}
      onCreateEvent={handleCreateEvent}
      refreshing={isRefetching}
      onRefresh={refetch}
    />
  );
}
