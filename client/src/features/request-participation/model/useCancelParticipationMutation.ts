import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notifyError } from "@/shared/lib";

import { cancelParticipation } from "../api/request-participation";

import { invalidateParticipation } from "./invalidate-participation";

export function useCancelParticipationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => cancelParticipation(eventId),
    onError: notifyError("Couldn't cancel participation"),
    onSuccess: (_data, eventId) => invalidateParticipation(queryClient, eventId),
  });
}
