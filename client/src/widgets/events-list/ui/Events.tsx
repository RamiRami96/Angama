import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Event, EventCard } from "@/entities/event";
import { GradientButton } from "@/shared/ui";

import type { EventFiltersState } from "../model/useEventFilters";

import { FilterPanel } from "./FilterPanel";
import { SearchBar } from "./SearchBar";

export type EventsProps = {
  events: Event[];
  filters: EventFiltersState;
  loading: boolean;
  onPressEvent: (id: string) => void;
  onCreateEvent: () => void;
  refreshing: boolean;
  onRefresh: () => void;
};

export function Events({
  events,
  filters,
  loading,
  onPressEvent,
  onCreateEvent,
  refreshing,
  onRefresh,
}: EventsProps) {
  const { top, bottom } = useSafeAreaInsets();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} onPress={() => onPressEvent(item.id)} />}
        ListHeaderComponent={
          <View style={{ gap: 12, paddingBottom: 4 }}>
            <View className="flex-row items-center gap-2">
              <SearchBar value={filters.q} onChangeText={filters.setQ} />
              <Pressable
                onPress={() => setFiltersOpen((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel="Filters"
                accessibilityState={{ expanded: filtersOpen }}
                className={`h-12 px-3 rounded-2xl flex-row items-center gap-1.5 active:opacity-70 ${
                  filtersOpen ? "bg-white" : "bg-white/15"
                }`}
              >
                <Ionicons
                  name="options-outline"
                  size={18}
                  color={filtersOpen ? "#000" : "#fff"}
                />
                {filters.activeCount > 0 && (
                  <Text className={`text-sm font-semibold ${filtersOpen ? "text-black" : "text-white"}`}>
                    {filters.activeCount}
                  </Text>
                )}
              </Pressable>
            </View>
            {filtersOpen && <FilterPanel state={filters} />}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-16">
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <View className="items-center py-16 gap-2">
              <Text className="text-white/70 text-base">No events found</Text>
              <Text className="text-white/50 text-sm">Try a different search or filters</Text>
            </View>
          )
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: top + 16,
          paddingBottom: bottom + 88,
          gap: 12,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      />

      <View style={{ position: "absolute", bottom, left: 16, right: 16 }}>
        <GradientButton label="Create Event" onPress={onCreateEvent} />
      </View>
    </View>
  );
}
