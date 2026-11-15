import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "access_token";

// Keychain / Keystore on devices. Web has no secure store, so it keeps the
// previous AsyncStorage (localStorage) behaviour.
const useSecureStore = Platform.OS !== "web";

let cache: string | null | undefined;

async function readStored(): Promise<string | null> {
  if (!useSecureStore) return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  // Earlier versions kept the token in plain AsyncStorage; drop that copy.
  AsyncStorage.removeItem(ACCESS_TOKEN_KEY).catch(() => {});
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  if (cache === undefined) cache = await readStored();
  return cache;
}

export async function setAccessToken(token: string): Promise<void> {
  cache = token;
  if (useSecureStore) await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  else await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function clearAccessToken(): Promise<void> {
  cache = null;
  if (useSecureStore) await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  else await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}
