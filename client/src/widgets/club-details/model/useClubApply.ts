import { useRouter } from "expo-router";
import { useState } from "react";

import type { Club } from "@/entities/club";
import { useApplyToClubMutation } from "@/features/apply-to-club";

export function useClubApply(club: Club, alreadyApplied: boolean) {
  const router = useRouter();
  const applyMutation = useApplyToClubMutation();
  const [successVisible, setSuccessVisible] = useState(false);
  const [warnVisible, setWarnVisible] = useState(false);

  const handleApply = async () => {
    await applyMutation.mutateAsync(club.id);
    router.replace("/(main)/clubs");
  };

  const handleApplyPress = () => {
    if (alreadyApplied) {
      setWarnVisible(true);
    } else {
      setSuccessVisible(true);
    }
  };

  const handleConfirm = () => {
    setSuccessVisible(false);
    void handleApply();
  };

  return {
    successVisible,
    warnVisible,
    onApplyPress: handleApplyPress,
    onConfirm: handleConfirm,
    onWarnClose: () => setWarnVisible(false),
  };
}
