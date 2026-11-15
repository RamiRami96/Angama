import { useApplicantsQuery, useMyApplicationsQuery } from "@/entities/application";
import type { Club } from "@/entities/club";
import type { User } from "@/entities/user";
import {
  useAcceptApplicantMutation,
  useRejectApplicantMutation,
} from "@/features/manage-applicants";

export function useApplicants(hostedClub: Club | null, user: User | null) {
  const applicantsQuery = useApplicantsQuery(hostedClub?.id);
  const myApplicationsQuery = useMyApplicationsQuery(!!user);
  const acceptMutation = useAcceptApplicantMutation();
  const rejectMutation = useRejectApplicantMutation();

  const handleAccept = (userId: string) => {
    if (hostedClub) acceptMutation.mutate({ clubId: hostedClub.id, userId });
  };

  const handleReject = (userId: string) => {
    if (hostedClub) rejectMutation.mutate({ clubId: hostedClub.id, userId });
  };

  const handleRefreshApplications = async () => {
    await Promise.all([applicantsQuery.refetch(), myApplicationsQuery.refetch()]);
  };

  return {
    applicants: applicantsQuery.data ?? [],
    userApplications: myApplicationsQuery.data ?? [],
    handleAccept,
    handleReject,
    handleRefreshApplications,
  };
}
