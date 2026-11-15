import type { Club } from "@/entities/club";
import { request } from "@/shared/api";

import type { CreateClubData } from "../model/create-club.model";

export function createClub(data: CreateClubData): Promise<Club> {
  return request("/clubs", { method: "POST", body: JSON.stringify(data) });
}
