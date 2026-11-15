import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import { notifyError } from "@/shared/lib";

import { deleteClub } from "../api/delete-club";

export function useDeleteClubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClub(id),
    onError: notifyError("Couldn't delete club"),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all });
      queryClient.removeQueries({ queryKey: queryKeys.clubs.detail(id) });
    },
  });
}
