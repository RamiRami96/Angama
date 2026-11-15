import { Text, View } from "react-native";

import type { Club } from "@/entities/club";
import { GradientButton } from "@/shared/ui";

import { getClubStatus } from "../model/club-status";

type Props = {
  club: Club;
  onPress: () => void;
};

export function ApplyButton({ club, onPress }: Props) {
  const { canApply, applyLabel } = getClubStatus(club);

  return (
    <View style={{ paddingTop: 4 }}>
      {canApply ? (
        <GradientButton label={applyLabel} onPress={onPress} />
      ) : (
        <View className="h-14 rounded-full bg-white/15 items-center justify-center">
          <Text className="text-white/50 font-semibold text-base">{applyLabel}</Text>
        </View>
      )}
    </View>
  );
}
