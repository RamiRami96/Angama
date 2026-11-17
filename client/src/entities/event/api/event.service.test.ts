import { buildEventsQuery, normalizeEventFilters } from "./event.service";

describe("buildEventsQuery", () => {
  it("returns the bare path without filters", () => {
    expect(buildEventsQuery()).toBe("/events");
    expect(buildEventsQuery({})).toBe("/events");
  });

  it("URL-encodes the set filters", () => {
    expect(buildEventsQuery({ q: "chess club", city: "Berlin" })).toBe(
      "/events?q=chess%20club&city=Berlin",
    );
    expect(buildEventsQuery({ q: "a&b=c?" })).toBe("/events?q=a%26b%3Dc%3F");
  });

  it("includes every filter in a stable order", () => {
    expect(
      buildEventsQuery({
        date: "2030-01-01",
        city: "São Paulo",
        language: "en",
        category: "BOARD_GAMES",
        q: "x",
      }),
    ).toBe("/events?q=x&category=BOARD_GAMES&language=en&city=S%C3%A3o%20Paulo&date=2030-01-01");
  });

  it("omits blank values and trims the rest", () => {
    expect(buildEventsQuery({ q: "   ", city: "", language: undefined })).toBe("/events");
    expect(buildEventsQuery({ q: "  chess ", city: " " })).toBe("/events?q=chess");
  });
});

describe("normalizeEventFilters", () => {
  it("keeps only set, trimmed values (the same ones the URL carries)", () => {
    expect(normalizeEventFilters({ q: " chess ", city: "  ", category: "SPEAKING_CLUB" })).toEqual({
      q: "chess",
      category: "SPEAKING_CLUB",
    });
    expect(normalizeEventFilters({})).toEqual({});
  });
});
