import type { Event } from "@/entities/event";

import { getEventCapacity } from "./event-capacity";
import { getEventStatus } from "./event-status";

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
  organizer: { id: "o", name: "Organizer", avatarUrl: undefined },
  myParticipation: null,
  createdAt: "2029-01-01T00:00:00.000Z",
  ...over,
});

describe("getEventStatus", () => {
  it("lets users request a published event they have not joined", () => {
    expect(getEventStatus(event())).toMatchObject({
      canRequest: true,
      requestLabel: "Request to Join",
    });
  });

  it.each([
    [{ myParticipation: "REQUESTED" as const }, "Already Requested"],
    [{ myParticipation: "REJECTED" as const }, "Already Requested"],
    [{ spotsLeft: 0, participantCount: 4 }, "Event is Full"],
    [{ status: "CANCELLED" as const }, "Cancelled"],
    [{ status: "COMPLETED" as const }, "Completed"],
  ])("blocks requesting: %j", (over, label) => {
    expect(getEventStatus(event(over))).toMatchObject({ canRequest: false, requestLabel: label });
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
