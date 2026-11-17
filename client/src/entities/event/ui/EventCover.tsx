import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { View } from "react-native";

type Props = {
  uri: string | null;
  height: number;
  rounded?: boolean;
};

/** The event's cover image, or a neutral placeholder when it has none. */
export function EventCover({ uri, height, rounded }: Props) {
  const radius = rounded ? 24 : 0;

  if (!uri) {
    return (
      <View
        className="bg-white/10 items-center justify-center"
        style={{ height, borderRadius: radius }}
      >
        <Ionicons name="image-outline" size={32} color="rgba(255,255,255,0.35)" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ height, width: "100%", borderRadius: radius }}
      contentFit="cover"
      transition={150}
      accessibilityIgnoresInvertColors
    />
  );
}
