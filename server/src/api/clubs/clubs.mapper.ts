import { Prisma } from '../../../generated/prisma/client';
import {
  ClubStatus,
  RegistrationStatus,
} from '../../../generated/prisma/enums';

/** Everything `toClubDto` needs. Only counted/identifying registration fields. */
export const CLUB_INCLUDE = {
  host: { select: { id: true, name: true, avatarUrl: true } },
  registrations: {
    where: {
      status: {
        in: [RegistrationStatus.APPROVED, RegistrationStatus.PENDING],
      },
    },
    select: { userId: true, status: true },
  },
} satisfies Prisma.ClubInclude;

export type ClubWithRelations = Prisma.ClubGetPayload<{
  include: typeof CLUB_INCLUDE;
}>;

export type PublicClubStatus = 'active' | 'full' | 'cancelled';

/** "full" is derived from the approved headcount, never stored. */
export function deriveClubStatus(
  status: ClubStatus,
  approvedCount: number,
  maxMembers: number,
): PublicClubStatus {
  if (status === ClubStatus.CANCELLED) return 'cancelled';
  return approvedCount >= maxMembers ? 'full' : 'active';
}

export function toClubDto(club: ClubWithRelations, userId?: string) {
  const currentMemberCount = club.registrations.filter(
    (r) => r.status === RegistrationStatus.APPROVED,
  ).length;

  return {
    id: club.id,
    name: club.name,
    description: club.description,
    location: club.location,
    maxMembers: club.maxMembers,
    currentMemberCount,
    status: deriveClubStatus(club.status, currentMemberCount, club.maxMembers),
    startDate: club.startDate.toISOString(),
    endDate: (club.endDate ?? club.startDate).toISOString(),
    createdAt: club.createdAt.toISOString(),
    host: {
      id: club.host.id,
      name: club.host.name,
      ...(club.host.avatarUrl ? { avatarUrl: club.host.avatarUrl } : {}),
    },
    isRegistered: userId
      ? club.registrations.some((r) => r.userId === userId)
      : false,
  };
}
