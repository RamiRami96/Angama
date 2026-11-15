import type { Club } from "@/entities/club";

export function getClubMembers(club: Club) {
  return {
    membersRatio: club.currentMemberCount / club.maxMembers,
    spotsLeft: club.maxMembers - club.currentMemberCount,
  };
}
