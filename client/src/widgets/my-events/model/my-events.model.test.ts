import type { Event } from "@/entities/event";
import type { MyOrganizedEvent } from "@/entities/participation";

import { canManageEvent, describeOrganizedEvent } from "./my-events.model";

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
  maxParticipants: 10,
  participantCount: 3,
  spotsLeft: 7,
  price: null,
  language: { code: "en", name: "English" },
  status: "PUBLISHED",
  organizer: { id: "o", name: "Organizer", avatarUrl: undefined },
  myParticipation: null,
  createdAt: "2029-01-01T00:00:00.000Z",
  ...over,
});

const item = (
  over: Partial<Omit<MyOrganizedEvent, "event">> = {},
  eventOver: Partial<Event> = {},
): MyOrganizedEvent => ({
  event: event(eventOver),
  participantCount: 3,
  pendingCount: 2,
  ...over,
});

describe("describeOrganizedEvent", () => {
  it("labels status, capacity and pending requests", () => {
    expect(describeOrganizedEvent(item())).toEqual({
      statusLabel: "Published",
      capacityLabel: "3/10",
      pendingLabel: "2 pending",
    });
  });

  it("has no pending label when there are no requests", () => {
    expect(describeOrganizedEvent(item({ pendingCount: 0 })).pendingLabel).toBeNull();
  });

  it("uses the item's confirmed count, not the event's", () => {
    expect(describeOrganizedEvent(item({ participantCount: 5 })).capacityLabel).toBe("5/10");
  });

  it.each([
    ["DRAFT", "Draft"],
    ["CANCELLED", "Cancelled"],
    ["COMPLETED", "Completed"],
  ] as const)("labels a %s event", (status, label) => {
    expect(describeOrganizedEvent(item({}, { status })).statusLabel).toBe(label);
  });
});

describe("canManageEvent", () => {
  it.each([
    ["DRAFT", true],
    ["PUBLISHED", true],
    ["CANCELLED", false],
    ["COMPLETED", false],
  ] as const)("%s -> %s", (status, expected) => {
    expect(canManageEvent(status)).toBe(expected);
  });
});
