import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { formatDate } from "@/shared/lib";

import { Event } from "../model/event.model";
import { EVENT_STATUS_STYLE } from "../model/event-status-style";

type Props = {
  event: Event;
  onPress?: () => void;
};

export function EventCard({ event, onPress }: Props) {
  const status = EVENT_STATUS_STYLE[event.status];

  return (
    <Pressable
      onPress={onPress}
      className="bg-black/30 rounded-3xl p-4 gap-3 active:opacity-70"
    >
      <View className="flex-row items-start justify-between gap-2">
        <Text className="text-white font-semibold text-base flex-1" numberOfLines={1}>
          {event.name}
        </Text>
        <View className={`px-2 py-0.5 rounded-full ${status.bg}`}>
          <Text className={`text-xs font-medium ${status.text}`}>{status.label}</Text>
        </View>
      </View>

      <Text className="text-white text-sm leading-5" numberOfLines={2}>
        {event.description}
      </Text>

      <View className="flex-row gap-4">
        <View className="flex-row items-center gap-1">
          <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.5)" />
          <Text className="text-white/50 text-xs">{formatDate(event.startsAt)}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.5)" />
          <Text className="text-white/50 text-xs" numberOfLines={1}>
            {event.address}, {event.city}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-1 border-t border-white/10">
        <Text className="text-white/50 text-xs">
          {event.participantCount}/{event.maxParticipants} participants
        </Text>
        <Text className="text-white/50 text-xs">By {event.organizer.name}</Text>
      </View>
    </Pressable>
  );
}
