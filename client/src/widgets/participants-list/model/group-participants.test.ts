import type { Participant } from "@/entities/participation";

import { groupParticipants } from "./group-participants";

const p = (userId: string, status: Participant["status"]): Participant => ({
  userId,
  eventId: "e1",
  status,
  createdAt: "2030-01-01T10:00:00.000Z",
  user: { id: userId, name: userId, avatarUrl: undefined },
});

describe("groupParticipants", () => {
  it("splits requested from confirmed and drops rejected/cancelled", () => {
    const { requested, confirmed } = groupParticipants([
      p("a", "REQUESTED"),
      p("b", "APPROVED"),
      p("c", "REJECTED"),
      p("d", "CANCELLED"),
      p("e", "ATTENDED"),
      p("f", "NO_SHOW"),
      p("g", "REQUESTED"),
    ]);
    expect(requested.map((x) => x.userId)).toEqual(["a", "g"]);
    expect(confirmed.map((x) => x.userId)).toEqual(["b", "e", "f"]);
  });
});
