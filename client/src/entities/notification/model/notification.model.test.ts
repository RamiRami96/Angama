import { notificationListSchema, notificationSchema, notificationText, type Notification } from "./notification.model";

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

describe("notificationText", () => {
  it.each([
    [{ type: "PARTICIPATION_REQUESTED" as const }, "Anna requested to join Chess Night"],
    [{ type: "PARTICIPATION_APPROVED" as const, actorName: null }, "Your request for Chess Night was approved"],
    [{ type: "PARTICIPATION_REJECTED" as const, actorName: null }, "Your request for Chess Night was rejected"],
    [{ type: "EVENT_CANCELLED" as const, actorName: null }, "Chess Night was cancelled"],
  ])("describes %j", (over, text) => {
    expect(notificationText(notification(over))).toBe(text);
  });

  it("falls back to a generic actor when the actor is gone", () => {
    expect(notificationText(notification({ actorName: null }))).toBe(
      "Someone requested to join Chess Night",
    );
  });
});

describe("notificationSchema", () => {
  it("parses an unread server notification", () => {
    const parsed = notificationSchema.parse({
      id: "n1",
      type: "EVENT_CANCELLED",
      eventId: "e1",
      eventName: "Chess Night",
      actorName: null,
      read: false,
      createdAt: "2030-01-01T10:00:00.000Z",
    });
    expect(parsed.read).toBe(false);
    expect(parsed.actorName).toBeNull();
  });

  it("rejects an unknown type", () => {
    expect(notificationListSchema.safeParse([notification({ type: "NOPE" as never })]).success).toBe(
      false,
    );
  });
});
