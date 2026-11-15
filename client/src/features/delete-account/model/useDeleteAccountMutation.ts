import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notifyError } from "@/shared/lib";

import { deleteAccount } from "../api/delete-account";

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onError: notifyError("Couldn't delete account"),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
