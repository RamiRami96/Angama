import { request } from "@/shared/api";

export const usersService = {
  getHostedClub: (): Promise<{ id: string } | null> =>
    request("/users/me/hosted-club"),
};
