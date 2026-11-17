import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
  onPress: () => void;
};

export function CancelButton({ onPress }: Props) {
  return (
    <View style={{ paddingTop: 4 }}>
      <Pressable
        onPress={onPress}
        className="h-14 rounded-full bg-red-500/20 flex-row items-center justify-center gap-2 active:opacity-70"
      >
        <Ionicons name="close-circle-outline" size={18} color="#F87171" />
        <Text className="text-red-400 font-semibold text-base">Cancel Event</Text>
      </Pressable>
    </View>
  );
}
