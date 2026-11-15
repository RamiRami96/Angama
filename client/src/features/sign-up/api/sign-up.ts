import type { User } from "@/entities/user";
import { request, setAccessToken } from "@/shared/api";

export async function signUp(data: {
  name: string;
  email: string;
  password: string;
  dateOfBirth: string;
}): Promise<User> {
  const { user, accessToken } = await request<{ user: User; accessToken: string }>("/auth/sign-up", {
    method: "POST",
    body: JSON.stringify(data),
  });
  await setAccessToken(accessToken);
  return user;
}
