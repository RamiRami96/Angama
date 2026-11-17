import { useRouter } from "expo-router";
import { useState } from "react";

import type { Event } from "@/entities/event";
import { useCancelEventMutation } from "@/features/cancel-event";

export function useEventCancel(event: Event) {
  const router = useRouter();
  const cancelMutation = useCancelEventMutation();
  const [cancelVisible, setCancelVisible] = useState(false);

  const onCancelEvent = () => {
    setCancelVisible(false);
    cancelMutation.mutate(event.id, { onSuccess: () => router.replace("/(main)/events") });
  };

  return {
    cancelVisible,
    onCancelEvent,
    onCancelOpen: () => setCancelVisible(true),
    onCancelClose: () => setCancelVisible(false),
  };
}
