import { DEFAULT_LANGUAGE_LEVEL, removeLanguage, setLanguageLevel } from "./languages";

describe("language list helpers", () => {
  it("adds a language with the given level", () => {
    expect(setLanguageLevel([], "en", "B2")).toEqual([{ code: "en", level: "B2" }]);
  });

  it("changes the level of an existing language without duplicating", () => {
    const list = [{ code: "en", level: "A1" as const }, { code: "de", level: "B1" as const }];
    expect(setLanguageLevel(list, "en", "C1")).toEqual([
      { code: "en", level: "C1" },
      { code: "de", level: "B1" },
    ]);
  });

  it("removes a language", () => {
    const list = [{ code: "en", level: "A1" as const }, { code: "de", level: "B1" as const }];
    expect(removeLanguage(list, "en")).toEqual([{ code: "de", level: "B1" }]);
  });

  it("has a valid default level", () => {
    expect(DEFAULT_LANGUAGE_LEVEL).toBe("B1");
  });
});
