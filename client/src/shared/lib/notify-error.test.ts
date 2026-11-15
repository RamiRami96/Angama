import { ApiError } from "@/shared/api/api-error";

import { getErrorMessage } from "./notify-error";

describe("getErrorMessage", () => {
  it("shows server messages as-is", () => {
    expect(getErrorMessage(new ApiError(409, "Club is full"))).toBe("Club is full");
  });

  it("explains network failures (fetch rejects with TypeError)", () => {
    expect(getErrorMessage(new TypeError("Network request failed"))).toMatch(/connection/i);
  });

  it("never leaks unknown errors", () => {
    const msg = getErrorMessage(new Error("db password is hunter2"));
    expect(msg).not.toContain("hunter2");
    expect(msg).toMatch(/something went wrong/i);
  });
});
