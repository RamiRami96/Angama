import { useClubsQuery } from "@/entities/club";
import type { User } from "@/entities/user";

/**
 * The club the user hosts. The server allows one upcoming club per host and the
 * clubs list is already cached by the clubs tab, so no extra request is needed.
 */
export function useHostedClub(user: User | null) {
  const { data } = useClubsQuery();
  if (!user) return null;
  return data?.find((c) => c.host.id === user.id && c.status !== "cancelled") ?? null;
}
