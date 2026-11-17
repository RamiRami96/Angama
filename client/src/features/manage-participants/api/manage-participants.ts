import { request } from "@/shared/api";

export function approveParticipant(eventId: string, userId: string): Promise<void> {
  return request(`/events/${eventId}/participants/${userId}/approve`, { method: "PATCH" });
}

export function rejectParticipant(eventId: string, userId: string): Promise<void> {
  return request(`/events/${eventId}/participants/${userId}/reject`, { method: "PATCH" });
}
