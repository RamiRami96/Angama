import { useClubQuery } from "@/entities/club";
import { User, useHostedClubRefQuery } from "@/entities/user";

export function useHostedClub(user: User | null) {
  const hostedClubRefQuery = useHostedClubRefQuery(user?.id);

  const clubQuery = useClubQuery(hostedClubRefQuery.data?.id ?? "");

  return hostedClubRefQuery.data ? (clubQuery.data ?? null) : null;
}
