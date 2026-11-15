import { Alert } from "react-native";

import { ApiError } from "@/shared/api";

/** Turns anything thrown by the API layer into text safe to show a user. */
export function getErrorMessage(err: unknown): string {
  if (ApiError.is(err)) return err.message;
  // fetch() rejects with a TypeError when the network is unreachable.
  if (err instanceof TypeError) return "Can't reach the server. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}

/** Shared `onError` for mutations that have no inline error UI. */
export function notifyError(title: string) {
  return (err: unknown) => Alert.alert(title, getErrorMessage(err));
}
