import { eventListSchema, eventSchema } from "./event.model";

// Shaped exactly like the server's `toEventDto` output.
const serverEvent = {
  id: "e1",
  name: "Chess Night",
  description: "Casual games",
  category: { code: "BOARD_GAMES", name: "Board Games" },
  details: { game: "Chess", experienceLevel: "BEGINNER" },
  coverImageUrl: null,
  startsAt: "2030-01-01T18:00:00.000Z",
  endsAt: "2030-01-01T20:00:00.000Z",
  city: "Berlin",
  address: "Main St 1",
  maxParticipants: 8,
  participantCount: 3,
  spotsLeft: 5,
  price: null,
  language: { code: "en", name: "English" },
  status: "PUBLISHED",
  organizer: { id: "u1", name: "Anna" },
  myParticipation: null,
  createdAt: "2029-12-01T00:00:00.000Z",
};

describe("eventSchema", () => {
  it("parses a server-shaped event with null price and no organizer avatar", () => {
    const parsed = eventSchema.parse(serverEvent);
    expect(parsed.price).toBeNull();
    expect(parsed.organizer.avatarUrl).toBeUndefined();
    expect(parsed.category.code).toBe("BOARD_GAMES");
    expect(parsed.myParticipation).toBeNull();
  });

  it("parses the viewer's participation status and a numeric price", () => {
    const parsed = eventSchema.parse({
      ...serverEvent,
      price: 12.5,
      myParticipation: "REQUESTED",
      organizer: { id: "u1", name: "Anna", avatarUrl: "https://x.test/a.png" },
    });
    expect(parsed.price).toBe(12.5);
    expect(parsed.myParticipation).toBe("REQUESTED");
    expect(parsed.organizer.avatarUrl).toBe("https://x.test/a.png");
  });

  it("rejects an unknown event status", () => {
    expect(eventSchema.safeParse({ ...serverEvent, status: "active" }).success).toBe(false);
  });

  it("parses a list", () => {
    expect(eventListSchema.parse([serverEvent])).toHaveLength(1);
  });
});
