import { useRouter } from "expo-router";
import { useState } from "react";

import type { Club } from "@/entities/club";
import { useApplyToClubMutation } from "@/features/apply-to-club";

export function useClubApply(club: Club, alreadyApplied: boolean) {
  const router = useRouter();
  const applyMutation = useApplyToClubMutation();
  const [successVisible, setSuccessVisible] = useState(false);
  const [warnVisible, setWarnVisible] = useState(false);

  // The success modal appears only once the server accepted the application;
  // failures are reported by the mutation's own onError.
  const onApplyPress = () => {
    if (alreadyApplied) {
      setWarnVisible(true);
      return;
    }
    applyMutation.mutate(club.id, { onSuccess: () => setSuccessVisible(true) });
  };

  const onConfirm = () => {
    setSuccessVisible(false);
    router.replace("/(main)/clubs");
  };

  return {
    isApplying: applyMutation.isPending,
    successVisible,
    warnVisible,
    onApplyPress,
    onConfirm,
    onWarnClose: () => setWarnVisible(false),
  };
}
