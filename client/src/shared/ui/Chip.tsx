import { Pressable, Text } from "react-native";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`px-4 py-2 rounded-full active:opacity-70 ${selected ? "bg-white" : "bg-white/15"}`}
    >
      <Text className={`text-sm font-medium ${selected ? "text-primary" : "text-white"}`}>{label}</Text>
    </Pressable>
  );
}
