import { PARTICIPATION_STATUS_STYLE } from "./participation-status-style";
import { participationStatusSchema } from "./participation.model";

describe("PARTICIPATION_STATUS_STYLE", () => {
  it("covers all six participation statuses", () => {
    expect(participationStatusSchema.options).toHaveLength(6);
  });

  it.each(participationStatusSchema.options)("has a style for %s", (status) => {
    const style = PARTICIPATION_STATUS_STYLE[status];
    expect(style).toEqual({
      label: expect.any(String),
      bg: expect.any(String),
      text: expect.any(String),
    });
    expect(style.label.length).toBeGreaterThan(0);
  });
});
