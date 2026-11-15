import { Club } from "@/entities/club";

export function useClubMembers(club: Club) {
  const membersRatio = club.currentMemberCount / club.maxMembers;
  const spotsLeft = club.maxMembers - club.currentMemberCount;

  return { membersRatio, spotsLeft };
}
