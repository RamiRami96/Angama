import type { User } from "@/entities/user";
import { request, storeSid } from "@/shared/api";

export async function signUp(data: {
  name: string;
  email: string;
  password: string;
  dateOfBirth: string;
}): Promise<User> {
  const { _sid, ...user } = await request<User & { _sid: string }>("/auth/sign-up", {
    method: "POST",
    body: JSON.stringify(data),
  });
  await storeSid(_sid);
  return user;
}
