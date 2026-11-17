import { useState } from "react";

import type { Event } from "@/entities/event";
import { useCancelEventMutation } from "@/features/cancel-event";

export function useEventCancel(event: Event) {
  const cancelMutation = useCancelEventMutation();
  const [cancelVisible, setCancelVisible] = useState(false);

  // The mutation stores the cancelled event, so the screen re-renders as closed.
  const onCancelEvent = () => {
    setCancelVisible(false);
    cancelMutation.mutate(event.id);
  };

  return {
    cancelVisible,
    isCancelling: cancelMutation.isPending,
    onCancelEvent,
    onCancelOpen: () => setCancelVisible(true),
    onCancelClose: () => setCancelVisible(false),
  };
}
