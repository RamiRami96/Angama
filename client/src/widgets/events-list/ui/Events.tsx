import { FlatList, RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientButton } from "@/shared/ui";
import { Event, EventCard } from "@/entities/event";

import { SearchBar } from "./SearchBar";

export type EventsProps = {
  events: Event[];
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onPressEvent: (id: string) => void;
  onCreateEvent: () => void;
  refreshing: boolean;
  onRefresh: () => void;
};

export function Events({ events, searchQuery, onSearchChange, onPressEvent, onCreateEvent, refreshing, onRefresh }: EventsProps) {
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} onPress={() => onPressEvent(item.id)} />}
        ListHeaderComponent={
          <View style={{ gap: 16, paddingBottom: 8 }}>
            <SearchBar value={searchQuery} onChangeText={onSearchChange} />
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-16 gap-2">
            <Text className="text-gray-400 text-base">No events found</Text>
            <Text className="text-gray-300 text-sm">Try a different search</Text>
          </View>
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: top + 16,
          paddingBottom: bottom + 88,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      />

      <View
        style={{
          position: "absolute",
          bottom: bottom,
          left: 16,
          right: 16,
        }}
      >
        <GradientButton label="Create Event" onPress={onCreateEvent} />
      </View>
    </View>
  );
}
