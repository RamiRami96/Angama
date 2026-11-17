import { ScrollView, Text, View } from "react-native";

import { useCatalog } from "@/entities/catalog";
import { EXPERIENCE_LEVELS, LANGUAGE_LEVELS } from "@/shared/contracts";
import { Chip, Field } from "@/shared/ui";

import { CATEGORY_OPTIONS, EXPERIENCE_LEVEL_LABELS } from "../config/create-event.const";
import type { EventFormErrors, EventFormFields } from "../model/create-event.model";

import { DateTimePickerField } from "./DateTimePickerField";

type Props = {
  fields: EventFormFields;
  errors: EventFormErrors;
  /** Category cannot change once the event exists. */
  categoryLocked?: boolean;
  onChange: <K extends keyof EventFormFields>(key: K, value: EventFormFields[K]) => void;
};

function Label({ children }: { children: string }) {
  return (
    <Text className="text-white/70 text-xs font-semibold uppercase tracking-widest">{children}</Text>
  );
}

function ErrorText({ error }: { error?: string }) {
  return error ? <Text className="text-red-300 text-xs ml-1">{error}</Text> : null;
}

export function EventForm({ fields, errors, categoryLocked, onChange }: Props) {
  const { data: catalog } = useCatalog();
  const set = (key: keyof EventFormFields) => (v: string) => onChange(key, v);

  return (
    <View className="gap-4">
      <View style={{ gap: 6 }}>
        <Label>Category</Label>
        <View className="flex-row flex-wrap gap-2">
          {CATEGORY_OPTIONS.filter((o) => !categoryLocked || o.code === fields.category).map((o) => (
            <Chip
              key={o.code}
              label={o.label}
              selected={fields.category === o.code}
              onPress={() => !categoryLocked && onChange("category", o.code)}
            />
          ))}
        </View>
        {categoryLocked && (
          <Text className="text-white/50 text-xs ml-1">The category can&apos;t be changed.</Text>
        )}
      </View>

      <Field label="Name" value={fields.name} onChange={set("name")} error={errors.name} placeholder="Event name" />
      <Field
        label="Description"
        value={fields.description}
        onChange={set("description")}
        error={errors.description}
        placeholder="What is this event about?"
        multiline
      />

      {fields.category === "SPEAKING_CLUB" ? (
        <>
          <Field
            label="Topic"
            value={fields.topic}
            onChange={set("topic")}
            error={errors.topic}
            placeholder="e.g. Travel stories"
          />
          <View style={{ gap: 6 }}>
            <Label>Level (optional)</Label>
            <View className="flex-row flex-wrap gap-2">
              <Chip label="Any" selected={!fields.level} onPress={() => onChange("level", "")} />
              {LANGUAGE_LEVELS.map((level) => (
                <Chip
                  key={level}
                  label={level}
                  selected={fields.level === level}
                  onPress={() => onChange("level", level)}
                />
              ))}
            </View>
            <ErrorText error={errors.level} />
          </View>
        </>
      ) : (
        <>
          <Field
            label="Game"
            value={fields.game}
            onChange={set("game")}
            error={errors.game}
            placeholder="e.g. Catan"
          />
          <View style={{ gap: 6 }}>
            <Label>Experience level</Label>
            <View className="flex-row flex-wrap gap-2">
              {EXPERIENCE_LEVELS.map((level) => (
                <Chip
                  key={level}
                  label={EXPERIENCE_LEVEL_LABELS[level]}
                  selected={fields.experienceLevel === level}
                  onPress={() => onChange("experienceLevel", level)}
                />
              ))}
            </View>
            <ErrorText error={errors.experienceLevel} />
          </View>
        </>
      )}

      <View style={{ gap: 6 }}>
        <Label>Language</Label>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {catalog?.languages.map((l) => (
            <Chip
              key={l.code}
              label={l.name}
              selected={fields.language === l.code}
              onPress={() => onChange("language", l.code)}
            />
          ))}
        </ScrollView>
        <ErrorText error={errors.language} />
      </View>

      <Field label="City" value={fields.city} onChange={set("city")} error={errors.city} placeholder="e.g. Astana" />
      <Field
        label="Address"
        value={fields.address}
        onChange={set("address")}
        error={errors.address}
        placeholder="e.g. Main St 1, Room 201"
      />
      <DateTimePickerField
        label="Start Date & Time"
        value={fields.startsAt}
        onChange={set("startsAt")}
        error={errors.startsAt}
      />
      <DateTimePickerField
        label="End Date & Time"
        value={fields.endsAt}
        onChange={set("endsAt")}
        error={errors.endsAt}
      />
      <Field
        label="Max Participants"
        value={fields.maxParticipants}
        onChange={set("maxParticipants")}
        error={errors.maxParticipants}
        placeholder="e.g. 20"
        keyboardType="numeric"
      />
      <Field
        label="Price (optional, informational)"
        value={fields.price}
        onChange={set("price")}
        error={errors.price}
        placeholder="e.g. 5 — paid on site"
        keyboardType="numeric"
      />
      <Field
        label="Cover image URL (optional)"
        value={fields.coverImageUrl}
        onChange={set("coverImageUrl")}
        error={errors.coverImageUrl}
        placeholder="https://..."
        autoCapitalize="none"
      />
    </View>
  );
}
