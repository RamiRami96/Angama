import type { CreateEventDto } from "@/shared/contracts";

import { toUpdateEventDto } from "./edit-event.model";

const dto: CreateEventDto = {
  category: "SPEAKING_CLUB",
  name: "Chess",
  description: "",
  city: "Berlin",
  address: "Main St 1",
  language: "en",
  startsAt: "2030-01-01T10:00:00.000Z",
  endsAt: "2030-01-01T12:00:00.000Z",
  maxParticipants: 5,
  details: { topic: "Travel" },
  status: "PUBLISHED",
};

describe("toUpdateEventDto", () => {
  it("drops the non-PATCHable status and category", () => {
    const update = toUpdateEventDto(dto);
    expect(update).not.toHaveProperty("status");
    expect(update).not.toHaveProperty("category");
    expect(update).toMatchObject({ name: "Chess", maxParticipants: 5, details: { topic: "Travel" } });
  });

  it("clears a removed price and cover with null", () => {
    expect(toUpdateEventDto(dto)).toMatchObject({ price: null, coverImageUrl: null });
    expect(
      toUpdateEventDto({ ...dto, price: 3, coverImageUrl: "https://x.test/c.png" }),
    ).toMatchObject({ price: 3, coverImageUrl: "https://x.test/c.png" });
  });
});
