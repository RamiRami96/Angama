import { request } from "@/shared/api";

export function applyToClub(clubId: string): Promise<void> {
  return request(`/clubs/${clubId}/apply`, { method: "POST" });
}
