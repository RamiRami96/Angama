import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { Club } from "@/entities/club";

import { useClubStatus } from "../model/useClubStatus";

type Props = {
  club: Club;
  onBack: () => void;
};

export function ClubHeader({ club, onBack }: Props) {
  const { status } = useClubStatus(club);

  return (
    <>
      <Pressable
        onPress={onBack}
        className="flex-row items-center gap-2 active:opacity-70 self-start"
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
        <Text className="text-white font-medium text-base">Back</Text>
      </Pressable>

      <View style={{ gap: 6 }}>
        <View className="flex-row items-start gap-3">
          <Text className="text-white font-bold text-3xl flex-1">{club.name}</Text>
          <View className={`px-3 py-1 rounded-full mt-1 ${status.bg}`}>
            <Text className={`text-xs font-semibold ${status.text}`}>{status.label}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="person-outline" size={14} color="rgba(255,255,255,0.6)" />
          <Text className="text-white/60 text-sm">Hosted by {club.host.name}</Text>
        </View>
      </View>
    </>
  );
}
