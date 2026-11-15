import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { applyToClub } from "../api/apply-to-club";

export function useApplyToClubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clubId: string) => applyToClub(clubId),
    onSuccess: (_data, clubId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.detail(clubId) });
    },
  });
}
