import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { signUp } from "../api/sign-up";

export function useSignUpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signUp,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
    },
  });
}
