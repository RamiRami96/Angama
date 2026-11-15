import type { Club } from "@/entities/club";
import { useCurrentUser } from "@/entities/user";

import { useClubApply } from "./useClubApply";
import { useClubDelete } from "./useClubDelete";

export function useClubDetail(club: Club) {
  const currentUser = useCurrentUser();
  const isHost = currentUser?.id === club.host.id;
  const apply = useClubApply(club, club.isRegistered);
  const remove = useClubDelete(club);

  return { isHost, apply, remove };
}
