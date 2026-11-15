import { clearAccessToken, requestParsed } from "@/shared/api";

import { hostedClubRefSchema, User, userSchema } from "../model/user.model";

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      return await requestParsed("/auth/me", userSchema);
    } catch {
      await clearAccessToken();
      return null;
    }
  },

  getHostedClub: (): Promise<{ id: string } | null> =>
    requestParsed("/users/me/hosted-club", hostedClubRefSchema),
};
