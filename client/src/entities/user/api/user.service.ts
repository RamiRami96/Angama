import { ApiError, clearAccessToken, requestParsed } from "@/shared/api";

import { hostedClubRefSchema, User, userSchema } from "../model/user.model";

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      return await requestParsed("/auth/me", userSchema);
    } catch (err) {
      // Only a rejected session means "signed out". Network errors, timeouts
      // and 5xx must not wipe the token and log the user out.
      if (ApiError.is(err, 401)) {
        await clearAccessToken();
        return null;
      }
      throw err;
    }
  },

  getHostedClub: (): Promise<{ id: string } | null> =>
    requestParsed("/users/me/hosted-club", hostedClubRefSchema),
};
