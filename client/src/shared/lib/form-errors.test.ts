import { ApiError } from "@/shared/api/api-error";

import { toFormErrors } from "./form-errors";

const FIELDS = ["email", "password"] as const;

describe("toFormErrors", () => {
  it("maps server field errors onto the form's fields", () => {
    const err = new ApiError(400, "Bad Request", [
      { path: "email", message: "Invalid email address" },
      { path: "password", message: "Too short" },
    ]);
    expect(toFormErrors(err, FIELDS)).toEqual({
      fields: { email: "Invalid email address", password: "Too short" },
      root: undefined,
    });
  });

  it("keeps errors for unknown fields as a form-level message", () => {
    const err = new ApiError(400, "Bad Request", [
      { path: "email", message: "Invalid" },
      { path: "isAdmin", message: "Not allowed" },
    ]);
    const result = toFormErrors(err, FIELDS);
    expect(result.fields).toEqual({ email: "Invalid" });
    expect(result.root).toBe("Not allowed");
  });

  it("puts credential/network/server failures at the form level, not on a field", () => {
    expect(toFormErrors(new ApiError(401, "Invalid email or password"), FIELDS)).toEqual({
      fields: {},
      root: "Invalid email or password",
    });
    expect(toFormErrors(new TypeError("Network request failed"), FIELDS).root).toMatch(
      /connection/i,
    );
  });
});
