import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { formatDate, formatTime } from "@/shared/lib";

import { notificationText, type Notification, type NotificationType } from "../model/notification.model";

const ICON: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  PARTICIPATION_REQUESTED: "person-add-outline",
  PARTICIPATION_APPROVED: "checkmark-circle-outline",
  PARTICIPATION_REJECTED: "close-circle-outline",
  EVENT_CANCELLED: "calendar-clear-outline",
};

type Props = {
  notification: Notification;
  onPress: () => void;
};

export function NotificationItem({ notification: n, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${n.read ? "" : "Unread: "}${notificationText(n)}`}
      className={`flex-row items-center gap-3 rounded-2xl p-4 active:opacity-70 ${
        n.read ? "bg-black/20" : "bg-black/40"
      }`}
    >
      <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
        <Ionicons name={ICON[n.type]} size={20} color="#fff" />
      </View>
      <View className="flex-1" style={{ gap: 2 }}>
        <Text className={`text-sm ${n.read ? "text-white/70" : "text-white font-semibold"}`}>
          {notificationText(n)}
        </Text>
        <Text className="text-white/40 text-xs">
          {formatDate(n.createdAt)} · {formatTime(n.createdAt)}
        </Text>
      </View>
      {!n.read && <View testID="unread-dot" className="w-2.5 h-2.5 rounded-full bg-red-500" />}
    </Pressable>
  );
}
