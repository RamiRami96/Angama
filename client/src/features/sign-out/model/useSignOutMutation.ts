import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signOut } from "../api/sign-out";

export function useSignOutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
