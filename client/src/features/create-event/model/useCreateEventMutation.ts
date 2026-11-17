import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import type { CreateEventDto } from "@/shared/contracts";
import { notifyError } from "@/shared/lib";

import { createEvent } from "../api/create-event";

export function useCreateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventDto) => createEvent(data),
    onError: notifyError("Couldn't create event"),
    onSuccess: (event) => {
      queryClient.setQueryData(queryKeys.events.detail(event.id), event);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.myEventsAll });
    },
  });
}
