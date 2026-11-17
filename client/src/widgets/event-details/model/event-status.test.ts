import type { Event } from "@/entities/event";

import { getEventCapacity } from "./event-capacity";
import { getClosedLabel, getEventAction } from "./event-status";

const ORGANIZER = "o";
const VIEWER = "v";

const event = (over: Partial<Event> = {}): Event => ({
  id: "e1",
  name: "Chess",
  description: "",
  category: { code: "BOARD_GAMES", name: "Board Games" },
  details: {},
  coverImageUrl: null,
  startsAt: "2030-01-01T10:00:00.000Z",
  endsAt: "2030-01-01T12:00:00.000Z",
  city: "Berlin",
  address: "Main St 1",
  maxParticipants: 4,
  participantCount: 1,
  spotsLeft: 3,
  price: null,
  language: { code: "en", name: "English" },
  status: "PUBLISHED",
  organizer: { id: ORGANIZER, name: "Organizer", avatarUrl: undefined },
  myParticipation: null,
  createdAt: "2029-01-01T00:00:00.000Z",
  ...over,
});

describe("getEventAction", () => {
  it.each<[string, Partial<Event>, string | null, ReturnType<typeof getEventAction>]>([
    ["organizer of a published event", {}, ORGANIZER, "edit"],
    ["organizer of a draft", { status: "DRAFT" }, ORGANIZER, "edit"],
    ["organizer of a full event", { spotsLeft: 0, participantCount: 4 }, ORGANIZER, "edit"],
    ["stranger on a published event with room", {}, VIEWER, "request"],
    ["own REQUESTED participation", { myParticipation: "REQUESTED" }, VIEWER, "pending"],
    ["own APPROVED participation", { myParticipation: "APPROVED" }, VIEWER, "cancel-request"],
    ["stranger on a full event", { spotsLeft: 0, participantCount: 4 }, VIEWER, "full"],
    ["approved on a full event", { spotsLeft: 0, myParticipation: "APPROVED" }, VIEWER, "cancel-request"],
    ["cancelled event", { status: "CANCELLED" }, VIEWER, "closed"],
    ["completed event", { status: "COMPLETED" }, VIEWER, "closed"],
    ["organizer of a cancelled event", { status: "CANCELLED" }, ORGANIZER, "closed"],
    ["organizer of a completed event", { status: "COMPLETED" }, ORGANIZER, "closed"],
    ["approved on a cancelled event", { status: "CANCELLED", myParticipation: "APPROVED" }, VIEWER, "closed"],
    ["REJECTED participation (cannot re-request)", { myParticipation: "REJECTED" }, VIEWER, "none"],
    ["CANCELLED participation (cannot re-request)", { myParticipation: "CANCELLED" }, VIEWER, "none"],
    ["stranger on a draft", { status: "DRAFT" }, VIEWER, "none"],
  ])("%s", (_name, over, viewerId, expected) => {
    expect(getEventAction(event(over), viewerId)).toBe(expected);
  });

  describe("by time (stored status may be stale)", () => {
    const NOW = new Date("2030-01-01T11:00:00.000Z"); // between startsAt and endsAt
    const AFTER_END = new Date("2030-01-01T13:00:00.000Z");

    it("closes requests once the event has started", () => {
      expect(getEventAction(event(), VIEWER, NOW)).toBe("closed");
      expect(getEventAction(event({ spotsLeft: 0 }), VIEWER, NOW)).toBe("closed");
    });

    it("keeps participant actions while the event is running", () => {
      expect(getEventAction(event({ myParticipation: "APPROVED" }), VIEWER, NOW)).toBe(
        "cancel-request",
      );
      expect(getEventAction(event(), ORGANIZER, NOW)).toBe("edit");
    });

    it("treats an ended but still PUBLISHED event as closed for everyone", () => {
      expect(getEventAction(event(), VIEWER, AFTER_END)).toBe("closed");
      expect(getEventAction(event(), ORGANIZER, AFTER_END)).toBe("closed");
      expect(getEventAction(event({ myParticipation: "APPROVED" }), VIEWER, AFTER_END)).toBe(
        "closed",
      );
    });

    it("defaults `now` to the current time", () => {
      expect(
        getEventAction(
          event({ startsAt: "2000-01-01T10:00:00.000Z", endsAt: "2000-01-01T12:00:00.000Z" }),
          VIEWER,
        ),
      ).toBe("closed");
    });
  });

  it("treats a signed-out viewer as a stranger", () => {
    expect(getEventAction(event(), null)).toBe("request");
    expect(getEventAction(event(), undefined)).toBe("request");
  });
});

describe("getClosedLabel", () => {
  const NOW = new Date("2030-01-01T11:00:00.000Z");
  const AFTER_END = new Date("2030-01-01T13:00:00.000Z");

  it.each<[string, Partial<Event>, Date, string]>([
    ["cancelled", { status: "CANCELLED" }, NOW, "Event cancelled"],
    ["completed", { status: "COMPLETED" }, NOW, "Event completed"],
    ["ended but still PUBLISHED", {}, AFTER_END, "Event completed"],
    ["started, not ended", {}, NOW, "Event has started"],
  ])("%s", (_name, over, now, expected) => {
    expect(getClosedLabel(event(over), now)).toBe(expected);
  });
});

describe("getEventCapacity", () => {
  it("computes fill ratio and spots left", () => {
    expect(getEventCapacity(event({ participantCount: 3, spotsLeft: 1 }))).toEqual({
      fillRatio: 0.75,
      spotsLeft: 1,
    });
  });
});
