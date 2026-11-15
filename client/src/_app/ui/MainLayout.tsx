import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { BottomNav } from "@/widgets/bottom-nav";
import { brandGradient } from "@/shared/config";

export function MainLayout() {
  return (
    <LinearGradient
      colors={brandGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <Tabs
        tabBar={(props) => <BottomNav {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: "transparent" } }}
      >
        <Tabs.Screen name="clubs" />
        <Tabs.Screen name="settings" />
      </Tabs>
    </LinearGradient>
  );
}
