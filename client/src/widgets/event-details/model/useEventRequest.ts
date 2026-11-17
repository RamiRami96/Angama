import { useState } from "react";

import type { Event } from "@/entities/event";
import { useRequestParticipationMutation } from "@/features/request-participation";

export function useEventRequest(event: Event) {
  const requestMutation = useRequestParticipationMutation();
  const [successVisible, setSuccessVisible] = useState(false);

  // The success modal appears only once the server accepted the request;
  // failures are reported by the mutation's own onError. The refreshed detail
  // then shows the request as pending.
  const onRequestPress = () =>
    requestMutation.mutate(event.id, { onSuccess: () => setSuccessVisible(true) });

  return {
    isRequesting: requestMutation.isPending,
    successVisible,
    onRequestPress,
    onConfirm: () => setSuccessVisible(false),
  };
}
