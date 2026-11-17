import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import type { Event } from "@/entities/event";
import { formatDate, formatTime } from "@/shared/lib";

import { getEventCapacity } from "../model/event-capacity";
import { formatPrice, getCategoryDetailRows } from "../model/event-details-rows";

type Props = {
  event: Event;
};

export function EventInfoCard({ event }: Props) {
  const { fillRatio, spotsLeft } = getEventCapacity(event);
  const detailRows = getCategoryDetailRows(event);

  return (
    <View className="bg-black/30 rounded-3xl p-4 gap-4">
      {event.description ? (
        <>
          <View style={{ gap: 6 }}>
            <Text className="text-white/60 text-xs font-semibold uppercase tracking-widest">
              About
            </Text>
            <Text className="text-white text-sm leading-6">{event.description}</Text>
          </View>
          <View className="border-t border-white/10" />
        </>
      ) : null}

      <View style={{ gap: 8 }}>
        {detailRows.map((row) => (
          <InfoRow key={row.label} label={row.label} value={row.value} />
        ))}
        <InfoRow label="Language" value={event.language.name} />
        <InfoRow label="Price (informational)" value={formatPrice(event.price)} />
      </View>

      <View className="border-t border-white/10" />

      <View className="flex-row items-center gap-3">
        <View className="w-9 h-9 rounded-xl bg-white/10 items-center justify-center">
          <Ionicons name="calendar-outline" size={17} color="#fff" />
        </View>
        <View style={{ gap: 2 }}>
          <Text className="text-white font-medium text-sm">{formatDate(event.startsAt)}</Text>
          <Text className="text-white/60 text-xs">
            {formatTime(event.startsAt)} – {formatTime(event.endsAt)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="w-9 h-9 rounded-xl bg-white/10 items-center justify-center">
          <Ionicons name="location-outline" size={17} color="#fff" />
        </View>
        <View style={{ gap: 2 }}>
          <Text className="text-white font-medium text-sm">{event.address}</Text>
          <Text className="text-white/60 text-xs">{event.city}</Text>
        </View>
      </View>

      <View className="border-t border-white/10" />

      <View style={{ gap: 8 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons name="people-outline" size={16} color="rgba(255,255,255,0.6)" />
            <Text className="text-white/60 text-sm">Participants</Text>
          </View>
          <Text className="text-white font-semibold text-sm">
            {event.participantCount}/{event.maxParticipants}
          </Text>
        </View>
        <View className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <View
            className="h-full bg-white/50 rounded-full"
            style={{ width: `${Math.round(fillRatio * 100)}%` }}
          />
        </View>
        <Text className="text-white/50 text-xs">
          {spotsLeft > 0
            ? `${spotsLeft} of ${event.maxParticipants} spots left`
            : "No spots remaining"}
        </Text>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-white/60 text-sm">{label}</Text>
      <Text className="text-white font-medium text-sm flex-shrink text-right">{value}</Text>
    </View>
  );
}
