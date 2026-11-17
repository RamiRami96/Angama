import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { ParticipationRow, type MyParticipation } from "@/entities/participation";

type Props = {
  participations: MyParticipation[];
  onRefresh: () => void;
};

// Interim (Task 8): Task 11 builds the full My Events widget.
export function MyParticipationsList({ participations, onRefresh }: Props) {
  return (
    <View className="mx-4 mb-4 bg-white/15 rounded-3xl px-4">
      <View className="flex-row items-center justify-between pt-4 pb-1">
        <Text className="text-xs font-semibold text-white/60 uppercase tracking-widest">
          Participating
        </Text>
        <Pressable onPress={onRefresh} className="active:opacity-60 p-1">
          <Ionicons name="refresh-outline" size={16} color="rgba(255,255,255,0.6)" />
        </Pressable>
      </View>
      {participations.length === 0 ? (
        <View className="py-4">
          <Text className="text-white/40 text-sm text-center">No events yet</Text>
        </View>
      ) : (
        participations.map((p) => <ParticipationRow key={p.event.id} participation={p} />)
      )}
    </View>
  );
}
