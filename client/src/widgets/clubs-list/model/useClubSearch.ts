import { useMemo, useState } from "react";

import type { Club } from "@/entities/club";

export function useClubSearch(clubs: Club[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClubs = useMemo(() => {
    if (!searchQuery.trim()) return clubs;
    const q = searchQuery.toLowerCase();
    return clubs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
    );
  }, [searchQuery, clubs]);

  return { searchQuery, setSearchQuery, filteredClubs };
}
