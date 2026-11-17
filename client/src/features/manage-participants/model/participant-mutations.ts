import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import { notifyError } from "@/shared/lib";

import { approveParticipant, rejectParticipant } from "../api/manage-participants";

type Vars = { eventId: string; userId: string };

export function useApproveParticipantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, userId }: Vars) => approveParticipant(eventId, userId),
    onError: notifyError("Couldn't approve participant"),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.participants(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.myEvents("organizer") });
    },
  });
}

export function useRejectParticipantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, userId }: Vars) => rejectParticipant(eventId, userId),
    onError: notifyError("Couldn't reject participant"),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.participants(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.myEvents("organizer") });
    },
  });
}
