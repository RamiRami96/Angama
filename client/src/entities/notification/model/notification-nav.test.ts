import type { Notification } from "./notification.model";
import { notificationHref } from "./notification-nav";

const notification = (over: Partial<Notification> = {}): Notification => ({
  id: "n1",
  type: "PARTICIPATION_REQUESTED",
  eventId: "e1",
  eventName: "Chess Night",
  actorName: "Anna",
  read: false,
  createdAt: "2030-01-01T10:00:00.000Z",
  ...over,
});

describe("notificationHref", () => {
  it.each([
    "PARTICIPATION_REQUESTED",
    "PARTICIPATION_APPROVED",
    "PARTICIPATION_REJECTED",
    "EVENT_CANCELLED",
  ] as const)("opens the event for %s", (type) => {
    expect(notificationHref(notification({ type, eventId: "abc-123" }))).toBe("/events/abc-123");
  });
});
