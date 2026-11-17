import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EditPreferencesForm } from "@/features/edit-preferences";
import { EditProfileForm } from "@/features/edit-profile";
import { BrandGradient } from "@/shared/ui";

export function EditProfilePage() {
  const router = useRouter();
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
          onPress={() => router.back()}
          className="flex-row items-center gap-2 active:opacity-70 self-start"
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
          <Text className="text-white font-medium text-base">Back</Text>
        </Pressable>

        <Text className="text-white font-bold text-3xl">Edit profile</Text>

        <EditProfileForm />
        <EditPreferencesForm />
      </ScrollView>
    </BrandGradient>
  );
}
