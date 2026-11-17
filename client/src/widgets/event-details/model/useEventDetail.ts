import type { Event } from "@/entities/event";
import { useCurrentUser } from "@/entities/user";

import { useEventCancel } from "./useEventCancel";
import { useEventRequest } from "./useEventRequest";

export function useEventDetail(event: Event) {
  const currentUser = useCurrentUser();
  const isOrganizer = currentUser?.id === event.organizer.id;
  const request = useEventRequest(event, event.myParticipation !== null);
  const cancel = useEventCancel(event);

  return { isOrganizer, request, cancel };
}
