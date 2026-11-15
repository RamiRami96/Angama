import { requestParsed } from "@/shared/api";

import {
  Applicant,
  MyApplication,
  applicantSchema,
  myApplicationSchema,
} from "../model/application.model";

export const applicationsService = {
  getApplicants: (clubId: string): Promise<Applicant[]> =>
    requestParsed(`/clubs/${clubId}/applicants`, applicantSchema.array()),

  getMyApplications: (): Promise<MyApplication[]> =>
    requestParsed("/users/me/applications", myApplicationSchema.array()),
};
