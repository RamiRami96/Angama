import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { participationsService } from "./participation.service";

/** All participants of an event (organizer only). */
export function useParticipantsQuery(eventId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.events.participants(eventId ?? ""),
    queryFn: () => participationsService.getParticipants(eventId as string),
    enabled: !!eventId,
  });
}

export function useMyOrganizedEventsQuery() {
  return useQuery({
    queryKey: queryKeys.users.myEvents("organizer"),
    queryFn: participationsService.getMyOrganizedEvents,
  });
}

export function useMyParticipationsQuery() {
  return useQuery({
    queryKey: queryKeys.users.myEvents("participant"),
    queryFn: participationsService.getMyParticipations,
  });
}
