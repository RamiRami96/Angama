import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { applicationsService } from "./application.service";

export function useApplicantsQuery(clubId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.clubs.applicants(clubId ?? ""),
    queryFn: () => applicationsService.getApplicants(clubId as string),
    enabled: !!clubId,
  });
}

export function useMyApplicationsQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.users.myApplications,
    queryFn: applicationsService.getMyApplications,
    enabled,
  });
}
