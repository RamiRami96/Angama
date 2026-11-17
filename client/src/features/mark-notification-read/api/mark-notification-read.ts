import { request } from "@/shared/api";

export function markNotificationRead(id: string): Promise<void> {
  return request(`/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead(): Promise<void> {
  return request("/notifications/read-all", { method: "POST" });
}
