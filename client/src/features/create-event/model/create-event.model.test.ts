import { createEventFormSchema, fieldOfIssue } from "./create-event.model";

const valid = {
  name: "  Chess  ",
  description: "",
  topic: "Travel",
  city: "Berlin",
  address: "Main St 1",
  language: "en",
  startsAt: "2030-01-01T10:00:00",
  endsAt: "2030-01-01T12:00:00",
  maxParticipants: "5",
};

// Mirrors useCreateEventForm: the first issue per field is the one shown.
const errorsOf = (input: object) => {
  const r = createEventFormSchema.safeParse(input);
  const out: Record<string, string> = {};
  if (!r.success) for (const i of r.error.issues) out[fieldOfIssue(i.path)] ??= i.message;
  return out;
};

describe("createEventFormSchema (form -> API payload)", () => {
  it("converts strings to the API payload", () => {
    const r = createEventFormSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Chess");
      expect(r.data.maxParticipants).toBe(5);
      expect(r.data.startsAt).toBe(new Date("2030-01-01T10:00:00").toISOString());
      expect(r.data.category).toBe("SPEAKING_CLUB");
      expect(r.data.details).toEqual({ topic: "Travel" });
      expect(r.data.status).toBe("PUBLISHED");
    }
  });

  it("reports blank name and topic from the shared contract on their fields", () => {
    expect(errorsOf({ ...valid, name: "   ", topic: " " })).toEqual({
      name: "Name is required",
      topic: "Topic is required",
    });
  });

  it("reports form-level problems on their fields", () => {
    expect(errorsOf({ ...valid, startsAt: "" }).startsAt).toBe("Pick a start date");
    expect(errorsOf({ ...valid, maxParticipants: "abc" }).maxParticipants).toBe(
      "Enter a whole number",
    );
    expect(errorsOf({ ...valid, maxParticipants: "0" }).maxParticipants).toBe(
      "Max participants must be at least 1",
    );
    expect(errorsOf({ ...valid, endsAt: "2030-01-01T09:00:00" }).endsAt).toBe(
      "End must be after start",
    );
  });
});
