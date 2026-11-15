import { CLUB_STATUS_STYLE, type Club } from "@/entities/club";

const APPLY_LABELS: Partial<Record<Club["status"], string>> = {
  full: "Club is Full",
  cancelled: "Cancelled",
};

export function getClubStatus(club: Club) {
  const canApply = !club.isRegistered && club.status === "active";
  const applyLabel = club.isRegistered
    ? "Already Registered"
    : (APPLY_LABELS[club.status] ?? "Apply to Join");

  return { status: CLUB_STATUS_STYLE[club.status], canApply, applyLabel };
}
