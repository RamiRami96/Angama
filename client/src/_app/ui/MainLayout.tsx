import { Tabs } from "expo-router";
import { BrandGradient } from "@/shared/ui";
import { BottomNav } from "@/widgets/bottom-nav";

export function MainLayout() {
  return (
    <BrandGradient style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <BottomNav {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: "transparent" } }}
      >
        <Tabs.Screen name="events" />
        <Tabs.Screen name="my-events" />
        <Tabs.Screen name="notifications" />
        <Tabs.Screen name="settings" />
      </Tabs>
    </BrandGradient>
  );
}
