import { request } from "@/shared/api";

export function requestParticipation(eventId: string): Promise<void> {
  return request(`/events/${eventId}/participation`, { method: "POST" });
}
