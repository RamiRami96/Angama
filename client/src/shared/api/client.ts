import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
export const API = `http://${debuggerHost ?? "localhost"}:3000`;
const ACCESS_TOKEN_KEY = "access_token";

const NO_REFRESH_PATHS = ["/auth/sign-in", "/auth/sign-up", "/auth/refresh", "/auth/sign-out"];

let accessTokenCache: string | null | undefined;
let refreshing: Promise<string | null> | null = null;

export async function getAccessToken(): Promise<string | null> {
  if (accessTokenCache === undefined) {
    accessTokenCache = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return accessTokenCache;
}

export async function setAccessToken(token: string): Promise<void> {
  accessTokenCache = token;
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function clearAccessToken(): Promise<void> {
  accessTokenCache = null;
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}

function refreshAccessToken(): Promise<string | null> {
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        await clearAccessToken();
        return null;
      }
      const { accessToken } = (await res.json()) as { accessToken: string };
      await setAccessToken(accessToken);
      return accessToken;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

function send(path: string, options: RequestInit, token: string | null) {
  return fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res = await send(path, options, await getAccessToken());

  if (res.status === 401 && !NO_REFRESH_PATHS.includes(path)) {
    const token = await refreshAccessToken();
    if (token) res = await send(path, options, token);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? "Request failed");
  }

  return res.json() as Promise<T>;
}
