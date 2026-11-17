import { request } from "@/shared/api";

export function requestParticipation(eventId: string): Promise<void> {
  return request(`/events/${eventId}/participation`, { method: "POST" });
}

/** Withdraws a pending request or an approved participation. */
export function cancelParticipation(eventId: string): Promise<void> {
  return request(`/events/${eventId}/participation/cancel`, { method: "POST" });
}
