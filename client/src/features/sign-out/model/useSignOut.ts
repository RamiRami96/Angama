import { router } from "expo-router";

import { useSignOutMutation } from "./useSignOutMutation";

export function useSignOut() {
  const mutation = useSignOutMutation();

  const handleSignOut = async () => {
    await mutation.mutateAsync();
    router.replace("/");
  };

  return { isLoading: mutation.isPending, handleSignOut };
}
