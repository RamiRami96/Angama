import type { User } from "@/entities/user";
import { request, storeSid } from "@/shared/api";

export async function signIn(email: string, password: string): Promise<User> {
  const { _sid, ...user } = await request<User & { _sid: string }>("/auth/sign-in", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await storeSid(_sid);
  return user;
}
