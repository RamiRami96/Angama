import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandGradient, GradientButton } from "@/shared/ui";
import { CreateEventErrors, CreateEventFields } from "../model/create-event.model";

import { DateTimePickerField } from "./DateTimePickerField";
import { Field } from "./Field";

type Props = {
  fields: CreateEventFields;
  errors: CreateEventErrors;
  isLoading: boolean;
  onChange: (key: keyof CreateEventFields, value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function CreateEvent({ fields, errors, isLoading, onChange, onSubmit, onBack }: Props) {
  const { top, bottom } = useSafeAreaInsets();

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
        <Pressable
          onPress={onBack}
          className="flex-row items-center gap-2 active:opacity-70 self-start"
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
          <Text className="text-white font-medium text-base">Back</Text>
        </Pressable>

        <Text className="text-white font-bold text-3xl">Create Speaking Club</Text>

        <View className="gap-4">
          <Field
            label="Name"
            value={fields.name}
            onChange={(v) => onChange("name", v)}
            error={errors.name}
            placeholder="Event name"
          />
          <Field
            label="Description"
            value={fields.description}
            onChange={(v) => onChange("description", v)}
            error={errors.description}
            placeholder="What is this event about?"
            multiline
          />
          <Field
            label="Topic"
            value={fields.topic}
            onChange={(v) => onChange("topic", v)}
            error={errors.topic}
            placeholder="e.g. Travel stories"
          />
          <Field
            label="Language"
            value={fields.language}
            onChange={(v) => onChange("language", v)}
            error={errors.language}
            placeholder="Language code, e.g. en"
          />
          <Field
            label="City"
            value={fields.city}
            onChange={(v) => onChange("city", v)}
            error={errors.city}
            placeholder="e.g. Astana"
          />
          <Field
            label="Address"
            value={fields.address}
            onChange={(v) => onChange("address", v)}
            error={errors.address}
            placeholder="e.g. Main St 1, Room 201"
          />
          <DateTimePickerField
            label="Start Date & Time"
            value={fields.startsAt}
            onChange={(v) => onChange("startsAt", v)}
          />
          {errors.startsAt && <Text className="text-red-300 text-xs ml-1">{errors.startsAt}</Text>}
          <DateTimePickerField
            label="End Date & Time"
            value={fields.endsAt}
            onChange={(v) => onChange("endsAt", v)}
          />
          {errors.endsAt && <Text className="text-red-300 text-xs ml-1">{errors.endsAt}</Text>}
          <Field
            label="Max Participants"
            value={fields.maxParticipants}
            onChange={(v) => onChange("maxParticipants", v)}
            error={errors.maxParticipants}
            placeholder="e.g. 20"
            keyboardType="numeric"
          />
        </View>

        <GradientButton label="Create Event" onPress={onSubmit} loading={isLoading} />
      </ScrollView>
    </BrandGradient>
  );
}
