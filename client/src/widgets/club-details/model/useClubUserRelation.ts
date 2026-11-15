import { Club } from "@/entities/club";
import { User } from "@/entities/user";

export function useClubUserRelation(club: Club, currentUser: User | null) {
  const isHost = currentUser?.id === club.host.id;
  const alreadyApplied = club.isRegistered;

  return { isHost, alreadyApplied };
}
