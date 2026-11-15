import { useHostedClubRefQuery } from "@/entities/user";
import { useClubQuery } from "@/entities/club";

// Temporary stopgap (removed in Task 6): composes the user + club entities.
export function useHostedClubQuery(userId: string | undefined) {
  const hostedClubRefQuery = useHostedClubRefQuery(userId);

  const clubQuery = useClubQuery(hostedClubRefQuery.data?.id ?? "");

  return hostedClubRefQuery.data ? (clubQuery.data ?? null) : null;
}
