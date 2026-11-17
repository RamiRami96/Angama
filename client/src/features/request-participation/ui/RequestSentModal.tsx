import { Ionicons } from "@expo/vector-icons";
import { Modal, Text, View } from "react-native";
import { GradientButton } from "@/shared/ui";
import { colors } from "@/shared/config";

type Props = {
  visible: boolean;
  eventName: string;
  onConfirm: () => void;
};

export function RequestSentModal({ visible, eventName, onConfirm }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", padding: 24 }}
      >
        <View className="bg-black/60 rounded-3xl p-6 w-full gap-5" style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}>
          <View className="items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-white/10 items-center justify-center">
              <Ionicons name="checkmark-circle" size={40} color={colors.secondary} />
            </View>
            <View className="items-center gap-1.5">
              <Text className="text-white font-bold text-xl text-center">
                Request Sent!
              </Text>
              <Text className="text-white/60 text-sm text-center leading-5">
                You have asked to join{"\n"}
                <Text className="text-white font-semibold">{eventName}</Text>
                {"\n"}The organizer will review your request.
              </Text>
            </View>
          </View>
          <GradientButton label="Got it" onPress={onConfirm} />
        </View>
      </View>
    </Modal>
  );
}
