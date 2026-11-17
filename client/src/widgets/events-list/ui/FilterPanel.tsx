import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { useCatalog } from "@/entities/catalog";
import type { EventCategoryCode } from "@/shared/contracts";
import { formatDate, useVisibility } from "@/shared/lib";
import { Chip } from "@/shared/ui";

import type { EventFiltersState } from "../model/useEventFilters";

type Props = {
  state: EventFiltersState;
};

const MUTED = "rgba(255,255,255,0.5)";

function Label({ children }: { children: string }) {
  return (
    <Text className="text-white/60 text-xs font-semibold uppercase tracking-widest">{children}</Text>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
const toIsoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** `YYYY-MM-DD` as a local date (a bare ISO date would parse as UTC midnight). */
const fromIsoDate = (v: string) => new Date(`${v}T00:00`);

export function FilterPanel({ state }: Props) {
  const { data: catalog } = useCatalog();
  const datePicker = useVisibility();

  return (
    <View className="bg-black/30 rounded-3xl p-4 gap-4">
      <View style={{ gap: 8 }}>
        <Label>Category</Label>
        <View className="flex-row flex-wrap gap-2">
          <Chip
            label="All"
            selected={!state.category}
            onPress={() => state.setCategory(undefined)}
          />
          {catalog?.categories.map((c) => (
            <Chip
              key={c.code}
              label={c.name}
              selected={state.category === c.code}
              onPress={() =>
                state.setCategory(
                  state.category === c.code ? undefined : (c.code as EventCategoryCode),
                )
              }
            />
          ))}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Label>Language</Label>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip
            label="Any"
            selected={!state.language}
            onPress={() => state.setLanguage(undefined)}
          />
          {catalog?.languages.map((l) => (
            <Chip
              key={l.code}
              label={l.name}
              selected={state.language === l.code}
              onPress={() => state.setLanguage(state.language === l.code ? undefined : l.code)}
            />
          ))}
        </ScrollView>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1" style={{ gap: 8 }}>
          <Label>City</Label>
          <View className="bg-white/15 rounded-2xl px-3 h-11 justify-center">
            <TextInput
              value={state.city}
              onChangeText={state.setCity}
              placeholder="Any city"
              placeholderTextColor="rgba(255,255,255,0.35)"
              className="text-white text-sm"
              autoCorrect={false}
            />
          </View>
        </View>

        <View className="flex-1" style={{ gap: 8 }}>
          <Label>Date</Label>
          <View className="flex-row items-center bg-white/15 rounded-2xl h-11 px-3 gap-2">
            <Pressable onPress={datePicker.show} className="flex-1 flex-row items-center gap-2 active:opacity-70">
              <Ionicons name="calendar-outline" size={15} color={MUTED} />
              <Text className={state.date ? "text-white text-sm" : "text-white/35 text-sm"}>
                {state.date ? formatDate(fromIsoDate(state.date).toISOString()) : "Any date"}
              </Text>
            </Pressable>
            {state.date && (
              <Pressable onPress={() => state.setDate(undefined)} accessibilityLabel="Clear date" hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={MUTED} />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {state.activeCount > 0 && (
        <Pressable onPress={state.reset} className="self-start active:opacity-70">
          <Text className="text-white/70 text-sm font-medium underline">Clear filters</Text>
        </Pressable>
      )}

      <DateTimePickerModal
        isVisible={datePicker.visible}
        mode="date"
        date={state.date ? fromIsoDate(state.date) : new Date()}
        onConfirm={(d) => {
          datePicker.hide();
          state.setDate(toIsoDate(d));
        }}
        onCancel={datePicker.hide}
      />
    </View>
  );
}
