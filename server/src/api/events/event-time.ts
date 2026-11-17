import { EventStatus } from '../../../generated/prisma/enums';

type TimedEvent = { status: EventStatus; endsAt: Date };

/**
 * Event completion is lazy (`EventsService.completeFinished`), so a stored
 * PUBLISHED (or DRAFT) status may be stale: the end time decides too.
 */
export function hasEnded(event: TimedEvent, now = Date.now()): boolean {
  return (
    event.status === EventStatus.COMPLETED || event.endsAt.getTime() <= now
  );
}
