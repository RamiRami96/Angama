import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandGradient } from "./BrandGradient";

type Props = {
  topContent: ReactNode;
  children: ReactNode;
};

export function ScreenLayout({ topContent, children }: Props) {
  const { top } = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <BrandGradient style={{
          height: 224 + top,
          paddingTop: top + 16,
          paddingBottom: 40,
          paddingHorizontal: 24,
          alignItems: "center",
          justifyContent: "flex-end",
        }}>
        {topContent}
      </BrandGradient>

      <ScrollView
        style={{ flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}
