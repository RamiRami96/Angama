import { editProfileFormSchema } from "./edit-profile.schema";

const form = { name: "Ann Lee", city: "Berlin", about: "", avatarUrl: "" };

describe("editProfileFormSchema", () => {
  it("turns an empty about into null", () => {
    const r = editProfileFormSchema.safeParse(form);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.about).toBeNull();
  });

  it("turns a whitespace-only about into null", () => {
    const r = editProfileFormSchema.safeParse({ ...form, about: "   " });
    expect(r.success && r.data.about).toBeNull();
  });

  it("turns an empty avatar URL into null (removes the avatar)", () => {
    const r = editProfileFormSchema.safeParse(form);
    expect(r.success && r.data.avatarUrl).toBeNull();
  });

  it("keeps a valid about and avatar URL", () => {
    const r = editProfileFormSchema.safeParse({
      ...form,
      about: " Hi there ",
      avatarUrl: "https://example.com/a.png",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.about).toBe("Hi there");
      expect(r.data.avatarUrl).toBe("https://example.com/a.png");
    }
  });

  it("rejects about over 1000 characters", () => {
    const r = editProfileFormSchema.safeParse({ ...form, about: "x".repeat(1001) });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["about"]);
  });

  it("accepts about of exactly 1000 characters", () => {
    expect(editProfileFormSchema.safeParse({ ...form, about: "x".repeat(1000) }).success).toBe(true);
  });

  it("rejects an empty name and city", () => {
    const r = editProfileFormSchema.safeParse({ ...form, name: "", city: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.path[0]).sort()).toEqual(["city", "name"]);
  });

  it("rejects a non-http avatar URL", () => {
    expect(editProfileFormSchema.safeParse({ ...form, avatarUrl: "javascript:alert(1)" }).success).toBe(false);
  });
});
