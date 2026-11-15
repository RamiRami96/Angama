import type { Club } from "@/entities/club";

import { getClubMembers } from "./club-members";
import { getClubStatus } from "./club-status";

const club = (over: Partial<Club> = {}): Club => ({
  id: "c1",
  name: "Chess",
  description: "",
  location: "",
  maxMembers: 4,
  currentMemberCount: 1,
  status: "active",
  startDate: "2030-01-01T10:00:00.000Z",
  endDate: "2030-01-01T12:00:00.000Z",
  createdAt: "2029-01-01T00:00:00.000Z",
  host: { id: "h", name: "Host", avatarUrl: undefined },
  isRegistered: false,
  ...over,
});

describe("getClubStatus", () => {
  it("lets users apply to an active club they have not joined", () => {
    expect(getClubStatus(club())).toMatchObject({ canApply: true, applyLabel: "Apply to Join" });
  });

  it.each([
    [{ isRegistered: true }, "Already Registered"],
    [{ status: "full" as const }, "Club is Full"],
    [{ status: "cancelled" as const }, "Cancelled"],
  ])("blocks applying: %j", (over, label) => {
    expect(getClubStatus(club(over))).toMatchObject({ canApply: false, applyLabel: label });
  });
});

describe("getClubMembers", () => {
  it("computes fill ratio and spots left", () => {
    expect(getClubMembers(club({ currentMemberCount: 3 }))).toEqual({
      membersRatio: 0.75,
      spotsLeft: 1,
    });
  });
});
