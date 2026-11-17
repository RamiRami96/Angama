import { useRouter } from "expo-router";

import type { Event } from "@/entities/event";
import { useCurrentUser } from "@/entities/user";
import { usePublishEventMutation } from "@/features/publish-event";

import { getEventAction } from "./event-status";
import { useEventCancel } from "./useEventCancel";
import { useEventParticipationCancel } from "./useEventParticipationCancel";
import { useEventRequest } from "./useEventRequest";

export function useEventDetail(event: Event) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const action = getEventAction(event, currentUser?.id);
  const request = useEventRequest(event);
  const cancel = useEventCancel(event);
  const leave = useEventParticipationCancel(event);
  const publishMutation = usePublishEventMutation();

  return {
    action,
    request,
    cancel,
    leave,
    publish: {
      isPublishing: publishMutation.isPending,
      onPublish: () => publishMutation.mutate(event.id),
    },
    onEdit: () => router.push(`/events/${event.id}/edit`),
  };
}
