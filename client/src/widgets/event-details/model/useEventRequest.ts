import { useRouter } from "expo-router";
import { useState } from "react";

import type { Event } from "@/entities/event";
import { useRequestParticipationMutation } from "@/features/request-participation";

export function useEventRequest(event: Event, alreadyRequested: boolean) {
  const router = useRouter();
  const requestMutation = useRequestParticipationMutation();
  const [successVisible, setSuccessVisible] = useState(false);
  const [warnVisible, setWarnVisible] = useState(false);

  // The success modal appears only once the server accepted the request;
  // failures are reported by the mutation's own onError.
  const onRequestPress = () => {
    if (alreadyRequested) {
      setWarnVisible(true);
      return;
    }
    requestMutation.mutate(event.id, { onSuccess: () => setSuccessVisible(true) });
  };

  const onConfirm = () => {
    setSuccessVisible(false);
    router.replace("/(main)/events");
  };

  return {
    isRequesting: requestMutation.isPending,
    successVisible,
    warnVisible,
    onRequestPress,
    onConfirm,
    onWarnClose: () => setWarnVisible(false),
  };
}
