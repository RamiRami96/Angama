import { request } from "@/shared/api";

export function acceptApplicant(clubId: string, userId: string): Promise<void> {
  return request(`/clubs/${clubId}/applicants/${userId}/accept`, { method: "PATCH" });
}

export function rejectApplicant(clubId: string, userId: string): Promise<void> {
  return request(`/clubs/${clubId}/applicants/${userId}/reject`, { method: "PATCH" });
}
