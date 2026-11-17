import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import type { UpdateEventDto } from "@/shared/contracts";
import { notifyError } from "@/shared/lib";

import { updateEvent } from "../api/update-event";

export function useUpdateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventDto }) => updateEvent(id, data),
    onError: notifyError("Couldn't save changes"),
    onSuccess: (event) => {
      queryClient.setQueryData(queryKeys.events.detail(event.id), event);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.myEventsAll });
    },
  });
}
