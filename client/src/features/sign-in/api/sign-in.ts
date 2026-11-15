import { authResponseSchema, type User } from "@/entities/user";
import { requestParsed, setAccessToken } from "@/shared/api";

export async function signIn(email: string, password: string): Promise<User> {
  const { user, accessToken } = await requestParsed("/auth/sign-in", authResponseSchema, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await setAccessToken(accessToken);
  return user;
}
