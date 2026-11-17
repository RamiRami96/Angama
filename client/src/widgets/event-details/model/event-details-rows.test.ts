import { formatPrice, getCategoryDetailRows } from "./event-details-rows";

describe("getCategoryDetailRows", () => {
  it("shows topic and level for a speaking club, skipping an unset level", () => {
    const category = { code: "SPEAKING_CLUB" as const, name: "Speaking Club" };
    expect(getCategoryDetailRows({ category, details: { topic: "Travel", level: "B2" } })).toEqual([
      { label: "Topic", value: "Travel" },
      { label: "Level", value: "B2" },
    ]);
    expect(getCategoryDetailRows({ category, details: { topic: "Travel" } })).toEqual([
      { label: "Topic", value: "Travel" },
    ]);
  });

  it("shows game and experience level for board games", () => {
    const category = { code: "BOARD_GAMES" as const, name: "Board Games" };
    expect(
      getCategoryDetailRows({ category, details: { game: "Catan", experienceLevel: "ADVANCED" } }),
    ).toEqual([
      { label: "Game", value: "Catan" },
      { label: "Experience level", value: "Advanced" },
    ]);
  });
});

describe("formatPrice", () => {
  it("labels missing or zero price as free", () => {
    expect(formatPrice(null)).toBe("Free");
    expect(formatPrice(0)).toBe("Free");
    expect(formatPrice(12.5)).toBe("12.5");
  });
});
