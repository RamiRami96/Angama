import type { Participant, ParticipationStatus } from "@/entities/participation";

const CONFIRMED: ParticipationStatus[] = ["APPROVED", "ATTENDED", "NO_SHOW"];

/** Pending requests vs confirmed participants; rejected/cancelled are hidden. */
export function groupParticipants(participants: Participant[]) {
  return {
    requested: participants.filter((p) => p.status === "REQUESTED"),
    confirmed: participants.filter((p) => CONFIRMED.includes(p.status)),
  };
}
