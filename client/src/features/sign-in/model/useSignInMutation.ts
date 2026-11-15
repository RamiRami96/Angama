import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { signIn } from "../api/sign-in";

export function useSignInMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
    },
  });
}
