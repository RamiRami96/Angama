import {
  buildDetails,
  createEventFormSchema,
  eventToFormFields,
  fieldOfIssue,
  type EventFormFields,
} from "./create-event.model";

const valid: EventFormFields = {
  category: "SPEAKING_CLUB",
  name: "  Chess  ",
  description: "",
  coverImageUrl: "",
  city: "Berlin",
  address: "Main St 1",
  language: "en",
  startsAt: "2030-01-01T10:00",
  endsAt: "2030-01-01T12:00",
  maxParticipants: "5",
  price: "",
  topic: "Travel",
  level: "",
  game: "",
  experienceLevel: "BEGINNER",
};

const boardGames: EventFormFields = { ...valid, category: "BOARD_GAMES", topic: "", game: "Catan" };

// Mirrors useEventForm: the first issue per field is the one shown.
const errorsOf = (input: EventFormFields) => {
  const r = createEventFormSchema.safeParse(input);
  const out: Record<string, string> = {};
  if (!r.success) for (const i of r.error.issues) out[fieldOfIssue(i.path)] ??= i.message;
  return out;
};

describe("buildDetails", () => {
  const detailFields = { topic: "Travel", level: "", game: "Chess", experienceLevel: "ADVANCED" };

  it("builds speaking club details and omits an empty level", () => {
    expect(buildDetails("SPEAKING_CLUB", detailFields)).toEqual({ topic: "Travel" });
    expect(buildDetails("SPEAKING_CLUB", { ...detailFields, level: "B2" })).toEqual({
      topic: "Travel",
      level: "B2",
    });
  });

  it("builds board games details with game and experience level", () => {
    expect(buildDetails("BOARD_GAMES", detailFields)).toEqual({
      game: "Chess",
      experienceLevel: "ADVANCED",
    });
  });
});

describe("createEventFormSchema (form -> CreateEventDto)", () => {
  it("converts a speaking club form to the API payload", () => {
    const r = createEventFormSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data).toEqual({
      category: "SPEAKING_CLUB",
      name: "Chess",
      description: "",
      city: "Berlin",
      address: "Main St 1",
      language: "en",
      startsAt: new Date("2030-01-01T10:00").toISOString(),
      endsAt: new Date("2030-01-01T12:00").toISOString(),
      maxParticipants: 5,
      details: { topic: "Travel" },
      status: "PUBLISHED",
    });
  });

  it("converts a board games form with price and cover", () => {
    const r = createEventFormSchema.safeParse({
      ...boardGames,
      price: " 12.50 ",
      coverImageUrl: " https://x.test/c.png ",
    });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.category).toBe("BOARD_GAMES");
    expect(r.data.details).toEqual({ game: "Catan", experienceLevel: "BEGINNER" });
    expect(r.data.price).toBe(12.5);
    expect(r.data.coverImageUrl).toBe("https://x.test/c.png");
  });

  it("requires a game for board games and a topic for speaking clubs", () => {
    expect(errorsOf({ ...boardGames, game: "  " }).game).toBe("Game is required");
    expect(errorsOf({ ...valid, topic: " " }).topic).toBe("Topic is required");
  });

  it("rejects an end before the start", () => {
    expect(errorsOf({ ...valid, endsAt: "2030-01-01T09:00" }).endsAt).toBe(
      "End must be after start",
    );
  });

  it("rejects a non-numeric or too small capacity", () => {
    expect(errorsOf({ ...valid, maxParticipants: "abc" }).maxParticipants).toBe(
      "Enter a whole number",
    );
    expect(errorsOf({ ...valid, maxParticipants: "2.5" }).maxParticipants).toBe(
      "Enter a whole number",
    );
    expect(errorsOf({ ...valid, maxParticipants: "0" }).maxParticipants).toBe(
      "Max participants must be at least 1",
    );
  });

  it("reports other form-level problems on their fields", () => {
    expect(errorsOf({ ...valid, name: "   " }).name).toBe("Name is required");
    expect(errorsOf({ ...valid, startsAt: "" }).startsAt).toBe("Pick a start date");
    expect(errorsOf({ ...valid, language: "" }).language).toBe("Language is required");
    expect(errorsOf({ ...valid, price: "free" }).price).toBe("Enter a valid price");
    expect(errorsOf({ ...valid, coverImageUrl: "ftp://x" }).coverImageUrl).toBe(
      "Invalid cover image URL",
    );
  });
});

describe("eventToFormFields", () => {
  it("fills the form from an existing event (dates as local date-time)", () => {
    const startsAt = new Date(2030, 0, 1, 18, 5).toISOString();
    const endsAt = new Date(2030, 0, 1, 20, 0).toISOString();
    const fields = eventToFormFields({
      category: { code: "BOARD_GAMES", name: "Board Games" },
      name: "Chess Night",
      description: "Casual",
      coverImageUrl: null,
      city: "Berlin",
      address: "Main St 1",
      language: { code: "en", name: "English" },
      startsAt,
      endsAt,
      maxParticipants: 8,
      price: 12.5,
      details: { game: "Chess", experienceLevel: "ADVANCED" },
    });
    expect(fields).toEqual({
      ...valid,
      category: "BOARD_GAMES",
      name: "Chess Night",
      description: "Casual",
      startsAt: "2030-01-01T18:05",
      endsAt: "2030-01-01T20:00",
      maxParticipants: "8",
      price: "12.5",
      topic: "",
      game: "Chess",
      experienceLevel: "ADVANCED",
    });
    // Round-trips through the schema.
    expect(createEventFormSchema.safeParse(fields).success).toBe(true);
  });
});
