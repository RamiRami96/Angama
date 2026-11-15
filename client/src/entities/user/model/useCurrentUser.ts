import { useCurrentUserQuery } from "../api/user.queries";

export function useCurrentUser() {
  const { data } = useCurrentUserQuery();
  return data ?? null;
}
