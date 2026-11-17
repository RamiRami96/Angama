import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import { notifyError } from "@/shared/lib";

import { cancelEvent } from "../api/cancel-event";

export function useCancelEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelEvent(id),
    onError: notifyError("Couldn't cancel event"),
    onSuccess: (event) => {
      queryClient.setQueryData(queryKeys.events.detail(event.id), event);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.myEventsAll });
    },
  });
}
