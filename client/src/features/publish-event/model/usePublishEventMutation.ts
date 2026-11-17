import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import { notifyError } from "@/shared/lib";

import { publishEvent } from "../api/publish-event";

export function usePublishEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishEvent(id),
    onError: notifyError("Couldn't publish event"),
    onSuccess: (event) => {
      queryClient.setQueryData(queryKeys.events.detail(event.id), event);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.myEventsAll });
    },
  });
}
