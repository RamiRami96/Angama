import { Text, View } from "react-native";

import type { MyParticipation } from "../model/participation.model";
import { PARTICIPATION_STATUS_STYLE } from "../model/participation-status-style";

type Props = {
  participation: MyParticipation;
};

export function ParticipationRow({ participation }: Props) {
  const s = PARTICIPATION_STATUS_STYLE[participation.participationStatus];
  return (
    <View className="flex-row items-center py-3 border-b border-white/10">
      <Text className="text-white text-sm font-medium flex-1">{participation.event.name}</Text>
      <View className={`px-2.5 py-1 rounded-full ${s.bg}`}>
        <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
      </View>
    </View>
  );
}
