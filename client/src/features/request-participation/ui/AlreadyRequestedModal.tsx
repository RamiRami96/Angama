import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";
import { colors } from "@/shared/config";

type Props = {
  visible: boolean;
  eventName: string;
  onClose: () => void;
};

export function AlreadyRequestedModal({ visible, eventName, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", padding: 24 }}
      >
        <View className="bg-black/60 rounded-3xl p-6 w-full gap-5" style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}>
          <View className="items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-amber-500/20 items-center justify-center">
              <Ionicons name="warning" size={40} color={colors.accent} />
            </View>
            <View className="items-center gap-1.5">
              <Text className="text-white font-bold text-xl text-center">
                Already Requested
              </Text>
              <Text className="text-white/60 text-sm text-center leading-5">
                You have already requested to join{"\n"}
                <Text className="text-white font-semibold">{eventName}</Text>
                {"\n"}Please wait for the organizer to respond.
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onClose}
            className="h-14 rounded-full bg-amber-500/20 items-center justify-center active:opacity-70"
          >
            <Text className="text-amber-300 font-semibold text-base">OK, Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
