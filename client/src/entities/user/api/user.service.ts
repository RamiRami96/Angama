import { clearAccessToken, request } from "@/shared/api";

import { User } from "../model/user.model";

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      return await request<User>("/auth/me");
    } catch {
      await clearAccessToken();
      return null;
    }
  },

  getHostedClub: (): Promise<{ id: string } | null> =>
    request("/users/me/hosted-club"),
};
