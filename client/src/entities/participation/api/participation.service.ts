import { requestParsed } from "@/shared/api";

import {
  MyOrganizedEvent,
  MyParticipation,
  Participant,
  ParticipationStatus,
  myOrganizedEventSchema,
  myParticipationSchema,
  participantSchema,
} from "../model/participation.model";

export const participationsService = {
  getParticipants: (eventId: string, status?: ParticipationStatus): Promise<Participant[]> =>
    requestParsed(
      `/events/${eventId}/participants${status ? `?status=${status}` : ""}`,
      participantSchema.array(),
    ),

  getMyOrganizedEvents: (): Promise<MyOrganizedEvent[]> =>
    requestParsed("/users/me/events?role=organizer", myOrganizedEventSchema.array()),

  getMyParticipations: (): Promise<MyParticipation[]> =>
    requestParsed("/users/me/events?role=participant", myParticipationSchema.array()),
};
