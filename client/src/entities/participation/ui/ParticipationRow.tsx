import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { formatDate, formatTime } from "@/shared/lib";

import type { MyParticipation } from "../model/participation.model";
import { PARTICIPATION_STATUS_STYLE } from "../model/participation-status-style";

type Props = {
  participation: MyParticipation;
  onPress: () => void;
};

/** A "Participating" item: the event, its date and place, and my status. */
export function ParticipationRow({ participation, onPress }: Props) {
  const { event } = participation;
  const s = PARTICIPATION_STATUS_STYLE[participation.participationStatus];
  const muted = "rgba(255,255,255,0.5)";

  return (
    <Pressable onPress={onPress} className="bg-black/30 rounded-3xl p-4 gap-2 active:opacity-70">
      <View className="flex-row items-start gap-3">
        <Text className="text-white font-semibold text-base flex-1" numberOfLines={2}>
          {event.name}
        </Text>
        <View className={`px-2.5 py-1 rounded-full ${s.bg}`}>
          <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-1.5">
        <Ionicons name="calendar-outline" size={13} color={muted} />
        <Text className="text-white/60 text-xs">
          {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
        </Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <Ionicons name="location-outline" size={13} color={muted} />
        <Text className="text-white/60 text-xs flex-1" numberOfLines={1}>
          {event.city}, {event.address}
        </Text>
      </View>
    </Pressable>
  );
}
