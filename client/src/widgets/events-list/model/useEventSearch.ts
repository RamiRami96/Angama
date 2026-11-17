import { useMemo, useState } from "react";

import type { Event } from "@/entities/event";

// Interim local search (Task 8): Task 10 replaces it with server-side filters.
export function useEventSearch(events: Event[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.address.toLowerCase().includes(q)
    );
  }, [searchQuery, events]);

  return { searchQuery, setSearchQuery, filteredEvents };
}
