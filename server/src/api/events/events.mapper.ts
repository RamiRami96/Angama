import { Prisma } from '../../../generated/prisma/client';
import { ParticipationStatus } from '../../../generated/prisma/enums';

/** Statuses that occupy a spot (count towards `maxParticipants`). */
export const CONFIRMED_STATUSES: ParticipationStatus[] = [
  ParticipationStatus.APPROVED,
  ParticipationStatus.ATTENDED,
  ParticipationStatus.NO_SHOW,
];

/** Everything `toEventDto` needs. Only active participation rows are loaded. */
export const EVENT_INCLUDE = {
  organizer: { select: { id: true, name: true, avatarUrl: true } },
  category: true,
  language: true,
  participants: {
    where: {
      status: {
        in: [ParticipationStatus.REQUESTED, ...CONFIRMED_STATUSES],
      },
    },
    select: { userId: true, status: true },
  },
} satisfies Prisma.EventInclude;

export type EventWithRelations = Prisma.EventGetPayload<{
  include: typeof EVENT_INCLUDE;
}>;

/**
 * @param viewerStatus the viewer's status when it is not among the included
 *   rows (CANCELLED / REJECTED), looked up separately by the service.
 */
export function toEventDto(
  event: EventWithRelations,
  viewerId?: string,
  viewerStatus: ParticipationStatus | null = null,
) {
  const participantCount = event.participants.filter((p) =>
    CONFIRMED_STATUSES.includes(p.status),
  ).length;
  const mine = viewerId
    ? event.participants.find((p) => p.userId === viewerId)
    : undefined;

  return {
    id: event.id,
    name: event.name,
    description: event.description,
    category: { code: event.category.code, name: event.category.name },
    details: event.details as Record<string, unknown>,
    coverImageUrl: event.coverImageUrl,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
    city: event.city,
    address: event.address,
    maxParticipants: event.maxParticipants,
    participantCount,
    spotsLeft: Math.max(0, event.maxParticipants - participantCount),
    price: event.price === null ? null : Number(event.price),
    language: { code: event.language.code, name: event.language.name },
    status: event.status,
    organizer: {
      id: event.organizer.id,
      name: event.organizer.name,
      ...(event.organizer.avatarUrl
        ? { avatarUrl: event.organizer.avatarUrl }
        : {}),
    },
    myParticipation: mine?.status ?? (viewerId ? viewerStatus : null),
    createdAt: event.createdAt.toISOString(),
  };
}

export type EventDto = ReturnType<typeof toEventDto>;
