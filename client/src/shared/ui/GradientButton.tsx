import { ActivityIndicator, Pressable, Text } from "react-native";

import { BrandGradient } from "./BrandGradient";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function GradientButton({ label, onPress, loading, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className="active:opacity-80"
    >
      <BrandGradient horizontal style={{ height: 56, borderRadius: 9999, alignItems: "center", justifyContent: "center" }}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">{label}</Text>
        )}
      </BrandGradient>
    </Pressable>
  );
}
