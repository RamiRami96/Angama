import { useState } from "react";

import type { Event } from "@/entities/event";
import { useCancelParticipationMutation } from "@/features/request-participation";

/** Withdraw a pending request or give up an approved spot (after a confirm). */
export function useEventParticipationCancel(event: Event) {
  const mutation = useCancelParticipationMutation();
  const [visible, setVisible] = useState(false);

  return {
    visible,
    isCancelling: mutation.isPending,
    onOpen: () => setVisible(true),
    onClose: () => setVisible(false),
    onConfirm: () => {
      setVisible(false);
      mutation.mutate(event.id);
    },
  };
}
