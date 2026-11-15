import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import { notifyError } from "@/shared/lib";

import { acceptApplicant, rejectApplicant } from "../api/manage-applicants";

export function useAcceptApplicantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, userId }: { clubId: string; userId: string }) =>
      acceptApplicant(clubId, userId),
    onError: notifyError("Couldn't accept applicant"),
    onSuccess: (_data, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.applicants(clubId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all });
    },
  });
}

export function useRejectApplicantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, userId }: { clubId: string; userId: string }) =>
      rejectApplicant(clubId, userId),
    onError: notifyError("Couldn't reject applicant"),
    onSuccess: (_data, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.applicants(clubId) });
    },
  });
}
