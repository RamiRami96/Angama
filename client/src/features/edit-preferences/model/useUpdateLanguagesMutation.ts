import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import { notifyError } from "@/shared/lib";

import { updateLanguages } from "../api/edit-preferences";

export function useUpdateLanguagesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateLanguages>[0]) => updateLanguages(data),
    onError: notifyError("Couldn't save languages"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.preferences });
    },
  });
}
