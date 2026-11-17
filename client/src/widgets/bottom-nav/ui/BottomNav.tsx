import { Ionicons } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUnreadCount } from "@/entities/notification";

import { Route, TABS } from "../model/navigation";

type BottomNavProps = {
  state: { routes: Route[]; index: number };
  navigation: { navigate: (name: string) => void };
};

export function BottomNav({ state, navigation }: BottomNavProps) {
  const { bottom } = useSafeAreaInsets();
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <GlassView
      glassEffectStyle='clear'
      style={{
        flexDirection: "row",
        paddingBottom: bottom,
      }}
    >
      {state.routes.map((route, index) => {
        const tab = TABS.find((t) => t.name === route.name);
        const isActive = state.index === index;

        if (!tab) return null;

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{ flex: 1, alignItems: "center", paddingTop: 12, paddingBottom: 4, gap: 4 }}
          >
            <View>
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={24}
                color={isActive ? "#fff" : "rgba(255,255,255,0.5)"}
              />
              {tab.showsUnreadBadge && unreadCount > 0 && (
                <View
                  className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 items-center justify-center"
                >
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 12, fontWeight: "500", color: isActive ? "#fff" : "rgba(255,255,255,0.5)" }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </GlassView>
  );
}
