import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ParticipationRow } from "@/entities/participation";
import { CancelEventModal } from "@/features/cancel-event";

import { useMyEvents, type MyEventsSection } from "../model/useMyEvents";

import { OrganizedEventCard } from "./OrganizedEventCard";

const SECTIONS: { key: MyEventsSection; label: string }[] = [
  { key: "organized", label: "Organized by Me" },
  { key: "participating", label: "Participating" },
];

const EMPTY: Record<MyEventsSection, { title: string; hint: string }> = {
  organized: { title: "No events organized yet", hint: "Create one from the Events tab" },
  participating: { title: "Not participating in any events", hint: "Find one on the Events tab" },
};

export function MyEvents() {
  const { top } = useSafeAreaInsets();
  const s = useMyEvents();

  const header = (
    <View style={{ gap: 16, paddingBottom: 4 }}>
      <Text className="text-white text-3xl font-bold">My Events</Text>
      <View className="flex-row bg-black/30 rounded-full p-1" accessibilityRole="tablist">
        {SECTIONS.map(({ key, label }) => {
          const selected = s.section === key;
          return (
            <Pressable
              key={key}
              onPress={() => s.setSection(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className={`flex-1 h-10 rounded-full items-center justify-center ${selected ? "bg-white" : ""}`}
            >
              <Text className={`text-sm font-semibold ${selected ? "text-primary" : "text-white/70"}`}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const empty = s.isLoading ? (
    <View className="items-center py-16">
      <ActivityIndicator color="#fff" />
    </View>
  ) : (
    <View className="items-center py-16 gap-2">
      <Text className="text-white/70 text-base">{EMPTY[s.section].title}</Text>
      <Text className="text-white/50 text-sm">{EMPTY[s.section].hint}</Text>
    </View>
  );

  const listProps = {
    style: { flex: 1 },
    ListHeaderComponent: header,
    ListEmptyComponent: empty,
    contentContainerStyle: { paddingHorizontal: 16, paddingTop: top + 16, paddingBottom: 24, gap: 12 },
    showsVerticalScrollIndicator: false,
    refreshControl: <RefreshControl refreshing={s.refreshing} onRefresh={s.onRefresh} tintColor="#fff" />,
  };

  return (
    <View style={{ flex: 1 }}>
      {s.section === "organized" ? (
        <FlatList
          {...listProps}
          data={s.organized}
          keyExtractor={(item) => item.event.id}
          renderItem={({ item }) => (
            <OrganizedEventCard
              item={item}
              cancelling={s.cancel.cancellingId === item.event.id}
              onView={() => s.onView(item.event.id)}
              onEdit={() => s.onEdit(item.event.id)}
              onCancel={() => s.cancel.onOpen(item.event)}
            />
          )}
        />
      ) : (
        <FlatList
          {...listProps}
          data={s.participating}
          keyExtractor={(item) => item.event.id}
          renderItem={({ item }) => (
            <ParticipationRow participation={item} onPress={() => s.onView(item.event.id)} />
          )}
        />
      )}

      <CancelEventModal
        visible={s.cancel.target !== null}
        eventName={s.cancel.target?.name ?? ""}
        onConfirm={s.cancel.onConfirm}
        onCancel={s.cancel.onClose}
      />
    </View>
  );
}
