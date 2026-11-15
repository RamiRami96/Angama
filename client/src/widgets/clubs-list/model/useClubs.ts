import { useClubsQuery, type Club } from "@/entities/club";

// Stable reference, so memoized consumers (search) don't recompute while loading.
const NO_CLUBS: Club[] = [];

export function useClubs() {
  const { data, isRefetching, refetch } = useClubsQuery();

  // The server already returns upcoming clubs only (GET /clubs?upcoming=true).
  return { clubs: data ?? NO_CLUBS, isRefetching, refetch };
}
