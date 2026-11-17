import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { formatDate, formatTime } from "@/shared/lib";

import { Event } from "../model/event.model";
import { EVENT_STATUS_STYLE } from "../model/event-status-style";

import { EventCover } from "./EventCover";

type Props = {
  event: Event;
  onPress?: () => void;
};

export function EventCard({ event, onPress }: Props) {
  const status = EVENT_STATUS_STYLE[event.status];
  const muted = "rgba(255,255,255,0.5)";

  return (
    <Pressable onPress={onPress} className="bg-black/30 rounded-3xl overflow-hidden active:opacity-70">
      <EventCover uri={event.coverImageUrl} height={140} />

      <View className="p-4 gap-2.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-white/60 text-xs font-semibold uppercase tracking-widest">
            {event.category.name}
          </Text>
          {event.status !== "PUBLISHED" && (
            <View className={`px-2 py-0.5 rounded-full ${status.bg}`}>
              <Text className={`text-xs font-medium ${status.text}`}>{status.label}</Text>
            </View>
          )}
        </View>

        <Text className="text-white font-semibold text-base" numberOfLines={2}>
          {event.name}
        </Text>

        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={13} color={muted} />
          <Text className="text-white/60 text-xs">
            {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="location-outline" size={13} color={muted} />
          <Text className="text-white/60 text-xs flex-1" numberOfLines={1}>
            {event.city}, {event.address}
          </Text>
        </View>

        <View className="flex-row items-center justify-between pt-2 border-t border-white/10">
          <Text className="text-white/50 text-xs flex-1" numberOfLines={1}>
            By {event.organizer.name}
          </Text>
          <Text className={`text-xs font-medium ${event.spotsLeft > 0 ? "text-white/80" : "text-red-300"}`}>
            {event.spotsLeft > 0
              ? `${event.spotsLeft} of ${event.maxParticipants} spots left`
              : "Full"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
