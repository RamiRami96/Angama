import { Club, STATUS_STYLES } from "@/entities/club";

const APPLY_LABELS: Record<string, string> = {
  full: "Club is Full",
  cancelled: "Cancelled",
};

export function useClubStatus(club: Club) {
  const status = STATUS_STYLES[club.status];
  const canApply = !club.isRegistered && club.status === "active";
  const applyLabel = club.isRegistered
    ? "Already Registered"
    : (APPLY_LABELS[club.status] ?? "Apply to Join");

  return { status, canApply, applyLabel };
}
