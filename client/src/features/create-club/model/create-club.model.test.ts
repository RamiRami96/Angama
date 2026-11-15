import { createClubSchema } from "./create-club.model";

const valid = {
  name: "  Chess  ",
  description: "",
  location: "",
  startDate: "2030-01-01T10:00:00",
  maxMembers: "5",
};

// Mirrors useCreateClubForm: the first issue per field is the one shown.
const errorsOf = (input: object) => {
  const r = createClubSchema.safeParse(input);
  const out: Record<string, string> = {};
  if (!r.success) for (const i of r.error.issues) out[i.path.join(".")] ??= i.message;
  return out;
};

describe("createClubSchema (form -> API payload)", () => {
  it("converts strings to the API payload", () => {
    const r = createClubSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Chess");
      expect(r.data.maxMembers).toBe(5);
      expect(r.data.startDate).toBe(new Date("2030-01-01T10:00:00").toISOString());
    }
  });

  it("reports blank name from the shared contract on the name field", () => {
    expect(errorsOf({ ...valid, name: "   " })).toEqual({ name: "Name is required" });
  });

  it("reports form-level problems on their fields", () => {
    expect(errorsOf({ ...valid, startDate: "" }).startDate).toBe("Pick a start date");
    expect(errorsOf({ ...valid, maxMembers: "abc" }).maxMembers).toBe("Enter a whole number");
    expect(errorsOf({ ...valid, maxMembers: "0" }).maxMembers).toBe(
      "Max members must be at least 1",
    );
  });
});
