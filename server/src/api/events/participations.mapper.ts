import { Prisma } from '../../../generated/prisma/client';
import type { ParticipationStatus } from '../../../generated/prisma/enums';

type ParticipationRow = {
  userId: string;
  eventId: string;
  status: ParticipationStatus;
  createdAt: Date;
};

export const PARTICIPANT_INCLUDE = {
  user: { select: { id: true, name: true, avatarUrl: true } },
} satisfies Prisma.EventParticipantInclude;

export type ParticipantWithUser = Prisma.EventParticipantGetPayload<{
  include: typeof PARTICIPANT_INCLUDE;
}>;

export function toParticipationDto(p: ParticipationRow) {
  return {
    userId: p.userId,
    eventId: p.eventId,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  };
}

/** The organizer's view of a participant: the participation plus the user. */
export function toParticipantDto(p: ParticipantWithUser) {
  return {
    ...toParticipationDto(p),
    user: {
      id: p.user.id,
      name: p.user.name,
      ...(p.user.avatarUrl ? { avatarUrl: p.user.avatarUrl } : {}),
    },
  };
}

export type ParticipationDto = ReturnType<typeof toParticipationDto>;
export type ParticipantDto = ReturnType<typeof toParticipantDto>;
