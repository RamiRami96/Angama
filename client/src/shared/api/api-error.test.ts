import { ApiError } from "./api-error";

describe("ApiError", () => {
  it("carries status, message and field errors", () => {
    const err = new ApiError(400, "Bad", [{ path: "email", message: "Invalid" }]);
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(400);
    expect(err.errors).toEqual([{ path: "email", message: "Invalid" }]);
  });

  it("is() narrows by class and optionally by status", () => {
    const err = new ApiError(401, "no");
    expect(ApiError.is(err)).toBe(true);
    expect(ApiError.is(err, 401)).toBe(true);
    expect(ApiError.is(err, 500)).toBe(false);
    expect(ApiError.is(new Error("x"))).toBe(false);
    expect(ApiError.is(new TypeError("Network request failed"), 401)).toBe(false);
  });
});
