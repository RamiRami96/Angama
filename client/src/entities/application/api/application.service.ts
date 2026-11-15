import { request } from "@/shared/api";

export type Applicant = {
  userId: string;
  user: { id: string; name: string; avatarUrl?: string };
  clubId: string;
  status: "waiting" | "approved" | "rejected" | "cancelled";
};

export type MyApplication = {
  clubId: string;
  clubName: string;
  status: "waiting" | "approved" | "rejected" | "cancelled";
  registeredAt: string;
  club: { id: string; name: string; startDate: string; location: string };
};

export const applicationsService = {
  getApplicants: (clubId: string): Promise<Applicant[]> =>
    request(`/clubs/${clubId}/applicants`),

  getMyApplications: (): Promise<MyApplication[]> =>
    request("/users/me/applications"),
};
