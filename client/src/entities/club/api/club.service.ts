import { requestParsed } from "@/shared/api";

import { Club, clubListSchema, clubSchema } from "../model/club.model";

export const clubsService = {
  getAll: (): Promise<Club[]> => requestParsed("/clubs?upcoming=true", clubListSchema),

  getOne: (id: string): Promise<Club> => requestParsed(`/clubs/${id}`, clubSchema),
};
