import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import { notifyError } from "@/shared/lib";

import { createEvent } from "../api/create-event";
import type { CreateEventData } from "./create-event.model";

export function useCreateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventData) => createEvent(data),
    onError: notifyError("Couldn't create event"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.myEvents("organizer") });
    },
  });
}
