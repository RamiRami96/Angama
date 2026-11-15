import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandGradient, GradientButton } from "@/shared/ui";
import { CreateClubErrors, CreateClubFields } from "../model/create-club.model";

import { DateTimePickerField } from "./DateTimePickerField";
import { Field } from "./Field";

type Props = {
  fields: CreateClubFields;
  errors: CreateClubErrors;
  isLoading: boolean;
  onChange: (key: keyof CreateClubFields, value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function CreateClub({ fields, errors, isLoading, onChange, onSubmit, onBack }: Props) {
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

        <Text className="text-white font-bold text-3xl">Create Club</Text>

        <View className="gap-4">
          <Field
            label="Name"
            value={fields.name}
            onChange={(v) => onChange("name", v)}
            error={errors.name}
            placeholder="Club name"
          />
          <Field
            label="Description"
            value={fields.description}
            onChange={(v) => onChange("description", v)}
            error={errors.description}
            placeholder="What is this club about?"
            multiline
          />
          <Field
            label="Location"
            value={fields.location}
            onChange={(v) => onChange("location", v)}
            error={errors.location}
            placeholder="e.g. Astana, Room 201"
          />
          <DateTimePickerField
            label="Start Date & Time"
            value={fields.startDate}
            onChange={(v) => onChange("startDate", v)}
          />
          {errors.startDate && <Text className="text-red-300 text-xs ml-1">{errors.startDate}</Text>}
          <Field
            label="Max Members"
            value={fields.maxMembers}
            onChange={(v) => onChange("maxMembers", v)}
            error={errors.maxMembers}
            placeholder="e.g. 20"
            keyboardType="numeric"
          />
        </View>

        <GradientButton label="Create Club" onPress={onSubmit} loading={isLoading} />
      </ScrollView>
    </BrandGradient>
  );
}
