import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import { notifyError } from "@/shared/lib";

import { requestParticipation } from "../api/request-participation";

export function useRequestParticipationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => requestParticipation(eventId),
    onError: notifyError("Couldn't send request"),
    onSuccess: (_data, eventId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.myEvents("participant") });
    },
  });
}
