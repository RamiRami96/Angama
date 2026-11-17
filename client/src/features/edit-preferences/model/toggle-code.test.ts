import { toggleCode } from "./toggle-code";

describe("toggleCode", () => {
  it("adds a missing code", () => {
    expect(toggleCode(["A"], "B")).toEqual(["A", "B"]);
  });

  it("removes a present code", () => {
    expect(toggleCode(["A", "B"], "A")).toEqual(["B"]);
  });

  it("never duplicates and does not mutate the input", () => {
    const list = ["A"];
    const once = toggleCode(list, "B");
    expect(toggleCode(once, "B")).toEqual(["A"]);
    expect(once.filter((c) => c === "B")).toHaveLength(1);
    expect(list).toEqual(["A"]);
  });

  it("collapses pre-existing duplicates when removing", () => {
    expect(toggleCode(["A", "A", "B"], "A")).toEqual(["B"]);
  });
});
