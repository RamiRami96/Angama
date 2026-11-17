import { Text, View } from "react-native";

import type { Catalog } from "@/entities/catalog";
import { LANGUAGE_LEVELS, type LanguageLevel } from "@/shared/contracts";
import { Chip, GradientButton } from "@/shared/ui";

import type { LanguageEntry } from "../model/languages";

type Props = {
  catalog: Catalog;
  goals: string[];
  interests: string[];
  languages: LanguageEntry[];
  isSaving: boolean;
  onToggleGoal: (code: string) => void;
  onToggleInterest: (code: string) => void;
  onToggleLanguage: (code: string) => void;
  onChangeLevel: (code: string, level: LanguageLevel) => void;
  onSubmit: () => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-white/70 text-xs font-semibold uppercase tracking-widest">{title}</Text>
      {children}
    </View>
  );
}

export function EditPreferences({
  catalog,
  goals,
  interests,
  languages,
  isSaving,
  onToggleGoal,
  onToggleInterest,
  onToggleLanguage,
  onChangeLevel,
  onSubmit,
}: Props) {
  const levelOf = (code: string) => languages.find((l) => l.code === code)?.level;

  return (
    <View className="bg-white/10 rounded-3xl p-4 gap-5">
      <Text className="text-white font-bold text-xl">Preferences</Text>

      <Section title="Goals">
        <View className="flex-row flex-wrap gap-2">
          {catalog.goals.map((g) => (
            <Chip key={g.code} label={g.label} selected={goals.includes(g.code)} onPress={() => onToggleGoal(g.code)} />
          ))}
        </View>
      </Section>

      <Section title="Interests">
        <View className="flex-row flex-wrap gap-2">
          {catalog.interests.map((i) => (
            <Chip
              key={i.code}
              label={i.label}
              selected={interests.includes(i.code)}
              onPress={() => onToggleInterest(i.code)}
            />
          ))}
        </View>
      </Section>

      <Section title="Languages">
        <View className="flex-row flex-wrap gap-2">
          {catalog.languages.map((l) => (
            <Chip
              key={l.code}
              label={l.name}
              selected={levelOf(l.code) !== undefined}
              onPress={() => onToggleLanguage(l.code)}
            />
          ))}
        </View>

        {languages.length > 0 && (
          <View className="gap-3 mt-2">
            {languages.map((entry) => (
              <View key={entry.code} className="gap-1.5">
                <Text className="text-white text-sm font-medium">
                  {catalog.languages.find((l) => l.code === entry.code)?.name ?? entry.code} level
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {LANGUAGE_LEVELS.map((level) => (
                    <Chip
                      key={level}
                      label={level}
                      selected={entry.level === level}
                      onPress={() => onChangeLevel(entry.code, level)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </Section>

      <GradientButton label="Save preferences" onPress={onSubmit} loading={isSaving} />
    </View>
  );
}
