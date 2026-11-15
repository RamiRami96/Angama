import { request } from "@/shared/api";

import { Club } from "../model/club.model";

export const clubsService = {
  getAll: (): Promise<Club[]> => request("/clubs"),

  getOne: (id: string): Promise<Club> => request(`/clubs/${id}`),
};
