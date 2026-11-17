import { userSchema, type User } from "@/entities/user";
import { requestParsed } from "@/shared/api";

import type { EditProfileData } from "../model/edit-profile.schema";

export function updateProfile(data: EditProfileData): Promise<User> {
  return requestParsed("/users/me", userSchema, { method: "PATCH", body: JSON.stringify(data) });
}
