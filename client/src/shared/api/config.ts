import Constants from "expo-constants";

/**
 * Base URL of the API.
 * - Set EXPO_PUBLIC_API_URL for any real build (must be https in release).
 * - In development it falls back to the machine running the Expo dev server.
 */
function resolveApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (configured) {
    if (!__DEV__ && !configured.startsWith("https://")) {
      throw new Error("EXPO_PUBLIC_API_URL must use https in release builds");
    }
    return configured;
  }
  if (!__DEV__) {
    throw new Error("EXPO_PUBLIC_API_URL is not set");
  }
  const devHost = Constants.expoConfig?.hostUri?.split(":")[0];
  return `http://${devHost ?? "localhost"}:3000`;
}

export const API = resolveApiUrl();
