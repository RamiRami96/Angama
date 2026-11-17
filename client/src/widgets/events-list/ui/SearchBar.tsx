import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

const MUTED = "rgba(255,255,255,0.5)";

export function SearchBar({ value, onChangeText, placeholder = "Search events..." }: Props) {
  return (
    <View className="flex-1 flex-row items-center bg-white/15 rounded-2xl px-4 h-12 gap-3">
      <Ionicons name="search" size={18} color={MUTED} />
      <TextInput
        className="flex-1 text-white text-base"
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.35)"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} accessibilityLabel="Clear search" hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={MUTED} />
        </Pressable>
      )}
    </View>
  );
}
