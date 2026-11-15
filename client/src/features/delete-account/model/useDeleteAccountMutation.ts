import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAccount } from "../api/delete-account";

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
