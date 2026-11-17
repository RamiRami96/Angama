import type { Event } from "@/entities/event";

import { getEventCapacity } from "./event-capacity";
import { getEventAction } from "./event-status";

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

  it("treats a signed-out viewer as a stranger", () => {
    expect(getEventAction(event(), null)).toBe("request");
    expect(getEventAction(event(), undefined)).toBe("request");
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
