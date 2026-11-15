import { request } from "@/shared/api";

export function deleteClub(id: string): Promise<void> {
  return request(`/clubs/${id}`, { method: "DELETE" });
}
