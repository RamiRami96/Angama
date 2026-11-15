import { useMutation, useQueryClient } from "@tanstack/react-query";

import { clubsService, CreateClubData } from "@/shared/services/clubs.service";

import { queryKeys } from "@/shared/api";

export function useCreateClubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClubData) => clubsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all });
    },
  });
}

export function useDeleteClubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clubsService.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all });
      queryClient.removeQueries({ queryKey: queryKeys.clubs.detail(id) });
    },
  });
}

export function useApplyToClubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clubId: string) => clubsService.apply(clubId),
    onSuccess: (_data, clubId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.detail(clubId) });
    },
  });
}
