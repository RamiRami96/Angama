import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";
import { notifyError } from "@/shared/lib";

import { updatePreferences } from "../api/edit-preferences";

export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updatePreferences>[0]) => updatePreferences(data),
    onError: notifyError("Couldn't save preferences"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.preferences });
    },
  });
}
