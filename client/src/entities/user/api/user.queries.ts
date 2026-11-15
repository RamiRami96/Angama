import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { userService } from "./user.service";

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: userService.getCurrentUser,
  });
}

export function useHostedClubRefQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.hostedClub,
    queryFn: userService.getHostedClub,
    enabled: !!userId,
  });
}
