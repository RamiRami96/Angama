import type { User } from "@/entities/user";
import { clearSid, request, storeSid } from "@/shared/api";

export const authService = {
  async signUp(data: { name: string; email: string; password: string; dateOfBirth: string }): Promise<User> {
    const { _sid, ...user } = await request<User & { _sid: string }>("/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(data),
    });
    await storeSid(_sid);
    return user;
  },

  async signIn(email: string, password: string): Promise<User> {
    const { _sid, ...user } = await request<User & { _sid: string }>("/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await storeSid(_sid);
    return user;
  },

  async signOut(): Promise<void> {
    await request("/auth/sign-out", { method: "POST" }).catch(() => {});
    await clearSid();
  },

  async deleteAccount(): Promise<void> {
    await request("/auth/account", { method: "DELETE" });
    await clearSid();
  },
};
