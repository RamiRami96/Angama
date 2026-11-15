import { request } from "@/shared/api";

export const applicationsService = {
  accept: (clubId: string, userId: string): Promise<void> =>
    request(`/clubs/${clubId}/applicants/${userId}/accept`, { method: "PATCH" }),

  reject: (clubId: string, userId: string): Promise<void> =>
    request(`/clubs/${clubId}/applicants/${userId}/reject`, { method: "PATCH" }),
};
