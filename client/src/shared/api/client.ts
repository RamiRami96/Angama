import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { z } from "zod";

import { ApiError, type ApiFieldError } from "./api-error";

const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
export const API = `http://${debuggerHost ?? "localhost"}:3000`;
const ACCESS_TOKEN_KEY = "access_token";

const NO_REFRESH_PATHS = ["/auth/sign-in", "/auth/sign-up", "/auth/refresh", "/auth/sign-out"];

const refreshResponseSchema = z.object({ accessToken: z.string() });

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
      if (res.status === 401) {
        await clearAccessToken();
        return null;
      }
      if (!res.ok) throw new ApiError(res.status, "Could not refresh session");
      const { accessToken } = refreshResponseSchema.parse(await res.json());
      await setAccessToken(accessToken);
      return accessToken;
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

async function execute(path: string, options: RequestInit): Promise<unknown> {
  let res = await send(path, options, await getAccessToken());

  if (res.status === 401 && !NO_REFRESH_PATHS.includes(path)) {
    const token = await refreshAccessToken();
    if (token) res = await send(path, options, token);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      message?: string;
      errors?: ApiFieldError[];
    };
    throw new ApiError(res.status, body.message ?? "Request failed", body.errors);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
}

/** For endpoints whose response body we don't read (or that return nothing). */
export async function request(path: string, options: RequestInit = {}): Promise<void> {
  await execute(path, options);
}

/** Performs the request and validates the response body against `schema`. */
export async function requestParsed<S extends z.ZodType>(
  path: string,
  schema: S,
  options: RequestInit = {},
): Promise<z.output<S>> {
  const body = await execute(path, options);
  const result = schema.safeParse(body);
  if (!result.success) {
    if (__DEV__) console.warn(`Unexpected response from ${path}`, result.error.issues);
    throw new Error("Unexpected response from server");
  }
  return result.data;
}
