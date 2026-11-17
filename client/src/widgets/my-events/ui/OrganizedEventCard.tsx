import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { EVENT_STATUS_STYLE } from "@/entities/event";
import type { MyOrganizedEvent } from "@/entities/participation";
import { formatDate, formatTime } from "@/shared/lib";

import { canManageEvent, describeOrganizedEvent } from "../model/my-events.model";

type Props = {
  item: MyOrganizedEvent;
  cancelling: boolean;
  onView: () => void;
  onEdit: () => void;
  onCancel: () => void;
};

export function OrganizedEventCard({ item, cancelling, onView, onEdit, onCancel }: Props) {
  const { event } = item;
  const { statusLabel, capacityLabel, pendingLabel } = describeOrganizedEvent(item);
  const style = EVENT_STATUS_STYLE[event.status];
  const manageable = canManageEvent(event.status);
  const muted = "rgba(255,255,255,0.5)";

  return (
    <View className="bg-black/30 rounded-3xl p-4 gap-3">
      <Pressable onPress={onView} className="gap-2 active:opacity-70">
        <View className="flex-row items-start gap-3">
          <Text className="text-white font-semibold text-base flex-1" numberOfLines={2}>
            {event.name}
          </Text>
          <View className={`px-2.5 py-1 rounded-full ${style.bg}`}>
            <Text className={`text-xs font-semibold ${style.text}`}>{statusLabel}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={13} color={muted} />
          <Text className="text-white/60 text-xs">
            {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="people-outline" size={13} color={muted} />
            <Text className="text-white/80 text-xs font-medium">{capacityLabel}</Text>
          </View>
          {pendingLabel && (
            <View className="px-2 py-0.5 rounded-full bg-yellow-500/20">
              <Text className="text-yellow-300 text-xs font-semibold">{pendingLabel}</Text>
            </View>
          )}
        </View>
      </Pressable>

      <View className="flex-row gap-2 pt-3 border-t border-white/10">
        <ActionButton label="View" icon="eye-outline" onPress={onView} />
        {manageable && <ActionButton label="Edit" icon="create-outline" onPress={onEdit} />}
        {manageable && (
          <ActionButton
            label="Cancel"
            icon="close-circle-outline"
            onPress={onCancel}
            loading={cancelling}
            danger
          />
        )}
      </View>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  loading,
  danger,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  loading?: boolean;
  danger?: boolean;
}) {
  const color = danger ? "#F87171" : "#fff";
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      className={`flex-1 h-10 rounded-full flex-row items-center justify-center gap-1.5 active:opacity-70 ${
        danger ? "bg-red-500/20" : "bg-white/15"
      }`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <>
          <Ionicons name={icon} size={15} color={color} />
          <Text className={`text-sm font-semibold ${danger ? "text-red-400" : "text-white"}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
