import { signUpSchema } from "./sign-up.schema";

const valid = {
  name: "Ann Lee",
  email: "ann@example.com",
  password: "password1",
  dateOfBirth: "2000-01-31",
  city: "Berlin",
};

describe("signUpSchema city", () => {
  it("accepts a valid payload", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an empty city", () => {
    const r = signUpSchema.safeParse({ ...valid, city: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]).toMatchObject({ path: ["city"], message: "City is required" });
    }
  });

  it("rejects a whitespace-only city", () => {
    expect(signUpSchema.safeParse({ ...valid, city: "   " }).success).toBe(false);
  });

  it("rejects a missing city", () => {
    const { city: _city, ...rest } = valid;
    expect(signUpSchema.safeParse(rest).success).toBe(false);
  });
});
