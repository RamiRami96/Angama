import { useMemo } from "react";

import { useClubsQuery } from "@/entities/club";

export function useClubs() {
  const { data, isRefetching, refetch } = useClubsQuery();

  // Memoized so downstream memos (e.g. search) keep a stable `clubs` reference.
  const clubs = useMemo(() => {
    const now = Date.now();
    return (data ?? []).filter((c) => new Date(c.startDate).getTime() > now);
  }, [data]);

  return { clubs, isRefetching, refetch };
}
