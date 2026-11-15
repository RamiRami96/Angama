import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import { notifyError } from "@/shared/lib";

import { applyToClub } from "../api/apply-to-club";

export function useApplyToClubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clubId: string) => applyToClub(clubId),
    onError: notifyError("Couldn't send application"),
    onSuccess: (_data, clubId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.detail(clubId) });
    },
  });
}
