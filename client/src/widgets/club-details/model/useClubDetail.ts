import type { Club } from "@/entities/club";
import { useCurrentUser } from "@/entities/user";

import { useClubApply } from "./useClubApply";
import { useClubDelete } from "./useClubDelete";
import { useClubUserRelation } from "./useClubUserRelation";

export function useClubDetail(club: Club) {
  const currentUser = useCurrentUser();
  const { isHost, alreadyApplied } = useClubUserRelation(club, currentUser);
  const apply = useClubApply(club, alreadyApplied);
  const remove = useClubDelete(club);

  return { isHost, apply, remove };
}
