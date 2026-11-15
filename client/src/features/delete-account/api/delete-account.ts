import { clearSid, request } from "@/shared/api";

export async function deleteAccount(): Promise<void> {
  await request("/auth/account", { method: "DELETE" });
  await clearSid();
}
