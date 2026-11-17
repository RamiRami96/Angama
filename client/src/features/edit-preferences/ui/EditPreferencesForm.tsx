import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { useCatalog, type Catalog } from "@/entities/catalog";
import { useUserPreferencesQuery, type UserPreferences } from "@/entities/user";

import {
  DEFAULT_LANGUAGE_LEVEL,
  removeLanguage,
  setLanguageLevel,
  type LanguageEntry,
} from "../model/languages";
import { toggleCode } from "../model/toggle-code";
import { useUpdateLanguagesMutation } from "../model/useUpdateLanguagesMutation";
import { useUpdatePreferencesMutation } from "../model/useUpdatePreferencesMutation";
import { EditPreferences } from "./EditPreferences";

/** Holds the draft; mounted only once both queries have data so it can seed from them. */
function PreferencesDraft({ catalog, initial }: { catalog: Catalog; initial: UserPreferences }) {
  const [goals, setGoals] = useState(initial.goals);
  const [interests, setInterests] = useState(initial.interests);
  const [languages, setLanguages] = useState<LanguageEntry[]>(initial.languages);

  const preferencesMutation = useUpdatePreferencesMutation();
  const languagesMutation = useUpdateLanguagesMutation();

  const handleToggleLanguage = (code: string) =>
    setLanguages((prev) =>
      prev.some((l) => l.code === code)
        ? removeLanguage(prev, code)
        : setLanguageLevel(prev, code, DEFAULT_LANGUAGE_LEVEL),
    );

  const handleSubmit = async () => {
    // Both endpoints replace their own list; run them one after another so a
    // failure in the first one does not leave a half-applied silent result.
    try {
      await preferencesMutation.mutateAsync({ goals, interests });
      await languagesMutation.mutateAsync({ languages });
    } catch {
      // Already reported by the mutations' notifyError.
    }
  };

  return (
    <EditPreferences
      catalog={catalog}
      goals={goals}
      interests={interests}
      languages={languages}
      isSaving={preferencesMutation.isPending || languagesMutation.isPending}
      onToggleGoal={(code) => setGoals((prev) => toggleCode(prev, code))}
      onToggleInterest={(code) => setInterests((prev) => toggleCode(prev, code))}
      onToggleLanguage={handleToggleLanguage}
      onChangeLevel={(code, level) => setLanguages((prev) => setLanguageLevel(prev, code, level))}
      onSubmit={handleSubmit}
    />
  );
}

export function EditPreferencesForm() {
  const catalogQuery = useCatalog();
  const preferencesQuery = useUserPreferencesQuery();

  if (catalogQuery.data && preferencesQuery.data) {
    return <PreferencesDraft catalog={catalogQuery.data} initial={preferencesQuery.data} />;
  }

  const failed = catalogQuery.isError || preferencesQuery.isError;
  return (
    <View className="bg-white/10 rounded-3xl p-4 items-center gap-3">
      {failed ? (
        <Text className="text-white/80 text-sm text-center">
          Couldn&apos;t load your preferences. Please try again later.
        </Text>
      ) : (
        <ActivityIndicator color="#fff" />
      )}
    </View>
  );
}
