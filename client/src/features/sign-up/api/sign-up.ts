import { authResponseSchema, type User } from "@/entities/user";
import { requestParsed, setAccessToken } from "@/shared/api";

import type { SignUpFormData } from "../model/sign-up.schema";

export async function signUp(data: SignUpFormData): Promise<User> {
  const { user, accessToken } = await requestParsed("/auth/sign-up", authResponseSchema, {
    method: "POST",
    body: JSON.stringify(data),
  });
  await setAccessToken(accessToken);
  return user;
}
