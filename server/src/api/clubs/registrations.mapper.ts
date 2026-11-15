import { RegistrationStatus } from '../../../generated/prisma/enums';
import { mapRegistrationStatus } from '../../shared/util/registration-status.util';

/** Public shape returned by apply / accept / reject (no internal ids). */
export function toRegistrationDto(r: {
  userId: string;
  clubId: string;
  status: RegistrationStatus;
  registeredAt: Date;
}) {
  return {
    userId: r.userId,
    clubId: r.clubId,
    status: mapRegistrationStatus(r.status),
    registeredAt: r.registeredAt.toISOString(),
  };
}
