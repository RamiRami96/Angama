import type { User } from "@/entities/user";
import { request, setAccessToken } from "@/shared/api";

export async function signIn(email: string, password: string): Promise<User> {
  const { user, accessToken } = await request<{ user: User; accessToken: string }>("/auth/sign-in", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await setAccessToken(accessToken);
  return user;
}
