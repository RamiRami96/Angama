import type { Notification } from "./notification.model";

/** Every notification is about an event: tapping it opens that event. */
export function notificationHref(n: Notification): `/events/${string}` {
  return `/events/${n.eventId}`;
}
