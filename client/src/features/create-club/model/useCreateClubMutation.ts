import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import { notifyError } from "@/shared/lib";

import { createClub } from "../api/create-club";
import type { CreateClubData } from "./create-club.model";

export function useCreateClubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClubData) => createClub(data),
    onError: notifyError("Couldn't create club"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all });
    },
  });
}
