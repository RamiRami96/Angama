import { useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { Club } from "../model/club.model";
import { clubsService } from "./club.service";

export function useClubsQuery() {
  return useQuery({
    queryKey: queryKeys.clubs.all,
    queryFn: clubsService.getAll,
  });
}

export function useClubQuery(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.clubs.detail(id),
    queryFn: () => clubsService.getOne(id),
    enabled: !!id,
    initialData: () =>
      queryClient
        .getQueryData<Club[]>(queryKeys.clubs.all)
        ?.find((c) => c.id === id),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(queryKeys.clubs.all)?.dataUpdatedAt,
  });
}
