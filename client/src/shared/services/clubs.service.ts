import type { Club } from "@/entities/club";
import { request } from "@/shared/api";

export type CreateClubData = {
  name: string;
  description: string;
  location: string;
  startDate: string;
  maxMembers: number;
};

export const clubsService = {
  create: (data: CreateClubData): Promise<Club> =>
    request("/clubs", { method: "POST", body: JSON.stringify(data) }),

  remove: (id: string): Promise<void> =>
    request(`/clubs/${id}`, { method: "DELETE" }),

  apply: (clubId: string): Promise<void> =>
    request(`/clubs/${clubId}/apply`, { method: "POST" }),
};
