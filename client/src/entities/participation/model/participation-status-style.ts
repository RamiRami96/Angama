import type { ParticipationStatus } from "./participation-status";

export const PARTICIPATION_STATUS_STYLE: Record<
  ParticipationStatus,
  { label: string; bg: string; text: string }
> = {
  REQUESTED: { label: "Requested", bg: "bg-yellow-500/20",  text: "text-yellow-300" },
  APPROVED:  { label: "Approved",  bg: "bg-emerald-500/20", text: "text-emerald-300" },
  REJECTED:  { label: "Rejected",  bg: "bg-red-500/20",     text: "text-red-300" },
  CANCELLED: { label: "Cancelled", bg: "bg-white/10",       text: "text-white/40" },
  ATTENDED:  { label: "Attended",  bg: "bg-cyan-500/20",    text: "text-cyan-300" },
  NO_SHOW:   { label: "No-show",   bg: "bg-orange-500/20",  text: "text-orange-300" },
};
