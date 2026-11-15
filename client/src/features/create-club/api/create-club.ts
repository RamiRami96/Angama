import { clubSchema, type Club } from "@/entities/club";
import { requestParsed } from "@/shared/api";

import type { CreateClubData } from "../model/create-club.model";

export function createClub(data: CreateClubData): Promise<Club> {
  return requestParsed("/clubs", clubSchema, { method: "POST", body: JSON.stringify(data) });
}
