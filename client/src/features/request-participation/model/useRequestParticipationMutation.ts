import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notifyError } from "@/shared/lib";

import { requestParticipation } from "../api/request-participation";

import { invalidateParticipation } from "./invalidate-participation";

export function useRequestParticipationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => requestParticipation(eventId),
    onError: notifyError("Couldn't send request"),
    onSuccess: (_data, eventId) => invalidateParticipation(queryClient, eventId),
  });
}
