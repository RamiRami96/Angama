import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import type { Club } from "@/entities/club";
import { formatDate, formatTime } from "@/shared/lib";

import { useClubMembers } from "../model/useClubMembers";

type Props = {
  club: Club;
};

export function ClubInfoCard({ club }: Props) {
  const { membersRatio, spotsLeft } = useClubMembers(club);

  return (
    <View className="bg-black/30 rounded-3xl p-4 gap-4">
      <View style={{ gap: 6 }}>
        <Text className="text-white/60 text-xs font-semibold uppercase tracking-widest">
          About
        </Text>
        <Text className="text-white text-sm leading-6">{club.description}</Text>
      </View>

      <View className="border-t border-white/10" />

      <View className="flex-row items-center gap-3">
        <View className="w-9 h-9 rounded-xl bg-white/10 items-center justify-center">
          <Ionicons name="calendar-outline" size={17} color="#fff" />
        </View>
        <View style={{ gap: 2 }}>
          <Text className="text-white font-medium text-sm">{formatDate(club.startDate)}</Text>
          <Text className="text-white/60 text-xs">
            {formatTime(club.startDate)} – {formatTime(club.endDate)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="w-9 h-9 rounded-xl bg-white/10 items-center justify-center">
          <Ionicons name="location-outline" size={17} color="#fff" />
        </View>
        <View style={{ gap: 2 }}>
          <Text className="text-white font-medium text-sm">{club.location}</Text>
          <Text className="text-white/60 text-xs">In-person event</Text>
        </View>
      </View>

      <View className="border-t border-white/10" />

      <View style={{ gap: 8 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons name="people-outline" size={16} color="rgba(255,255,255,0.6)" />
            <Text className="text-white/60 text-sm">Members</Text>
          </View>
          <Text className="text-white font-semibold text-sm">
            {club.currentMemberCount}/{club.maxMembers}
          </Text>
        </View>
        <View className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <View
            className="h-full bg-white/50 rounded-full"
            style={{ width: `${Math.round(membersRatio * 100)}%` }}
          />
        </View>
        <Text className="text-white/50 text-xs">
          {spotsLeft > 0 ? `${spotsLeft} spots remaining` : "No spots remaining"}
        </Text>
      </View>
    </View>
  );
}
