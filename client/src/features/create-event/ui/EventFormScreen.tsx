import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { CreateEventDto } from "@/shared/contracts";
import { BrandGradient, GradientButton } from "@/shared/ui";

import type { EventFormFields } from "../model/create-event.model";
import { useEventForm } from "../model/useEventForm";

import { EventForm } from "./EventForm";

export type EventFormAction = {
  label: string;
  variant?: "primary" | "secondary";
  /** Called with the validated payload. */
  onSubmit: (dto: CreateEventDto) => void;
};

type Props = {
  title: string;
  initialFields?: EventFormFields;
  categoryLocked?: boolean;
  submitting: boolean;
  actions: EventFormAction[];
  onBack: () => void;
};

/** The event form screen shared by create and edit. */
export function EventFormScreen({
  title,
  initialFields,
  categoryLocked,
  submitting,
  actions,
  onBack,
}: Props) {
  const { top, bottom } = useSafeAreaInsets();
  const { fields, errors, handleChange, validate } = useEventForm(initialFields);
  const [pressed, setPressed] = useState<string | null>(null);

  const submit = (action: EventFormAction) => {
    const dto = validate();
    if (!dto) return;
    setPressed(action.label);
    action.onSubmit(dto);
  };

  return (
    <BrandGradient style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: top + 16,
          paddingBottom: bottom + 32,
          paddingHorizontal: 16,
          gap: 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={onBack} className="flex-row items-center gap-2 active:opacity-70 self-start">
          <Ionicons name="arrow-back" size={22} color="#fff" />
          <Text className="text-white font-medium text-base">Back</Text>
        </Pressable>

        <Text className="text-white font-bold text-3xl">{title}</Text>

        <EventForm
          fields={fields}
          errors={errors}
          categoryLocked={categoryLocked}
          onChange={handleChange}
        />

        <View className="gap-3">
          {actions.map((action) => {
            const loading = submitting && pressed === action.label;
            return action.variant === "secondary" ? (
              <Pressable
                key={action.label}
                onPress={() => submit(action)}
                disabled={submitting}
                className="h-14 rounded-full bg-white/15 items-center justify-center active:opacity-70"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-base">{action.label}</Text>
                )}
              </Pressable>
            ) : (
              <GradientButton
                key={action.label}
                label={action.label}
                onPress={() => submit(action)}
                loading={loading}
                disabled={submitting}
              />
            );
          })}
        </View>
      </ScrollView>
    </BrandGradient>
  );
}
