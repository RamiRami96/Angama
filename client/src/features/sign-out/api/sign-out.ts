import { clearAccessToken, request } from "@/shared/api";

export async function signOut(): Promise<void> {
  await request("/auth/sign-out", { method: "POST" }).catch(() => {});
  await clearAccessToken();
}
