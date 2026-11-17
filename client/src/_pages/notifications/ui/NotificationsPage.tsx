import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NotificationItem } from "@/entities/notification";

import { useNotificationsScreen } from "../model/useNotificationsScreen";

export function NotificationsPage() {
  const { top } = useSafeAreaInsets();
  const screen = useNotificationsScreen();

  return (
    <FlatList
      style={{ flex: 1 }}
      data={screen.notifications}
      keyExtractor={(n) => n.id}
      renderItem={({ item }) => (
        <NotificationItem notification={item} onPress={() => screen.onPressNotification(item)} />
      )}
      ListHeaderComponent={
        <View className="flex-row items-center justify-between pb-2">
          <Text className="text-white text-3xl font-bold">Alerts</Text>
          {screen.hasUnread && (
            <Pressable
              onPress={screen.onMarkAllRead}
              disabled={screen.isMarkingAll}
              accessibilityRole="button"
              className="flex-row items-center gap-1.5 px-3 py-2 rounded-full bg-white/15 active:opacity-70"
            >
              {screen.isMarkingAll ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
              )}
              <Text className="text-white text-sm font-medium">Mark all read</Text>
            </Pressable>
          )}
        </View>
      }
      ListEmptyComponent={
        screen.isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator color="#fff" />
          </View>
        ) : (
          <View className="items-center py-16 gap-2">
            <Ionicons name="notifications-off-outline" size={36} color="rgba(255,255,255,0.5)" />
            <Text className="text-white/70 text-base">No notifications yet</Text>
            <Text className="text-white/50 text-sm text-center">
              Requests and updates about your events will show up here
            </Text>
          </View>
        )
      }
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: top + 16, paddingBottom: 24, gap: 8 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={screen.refreshing} onRefresh={screen.onRefresh} tintColor="#fff" />
      }
    />
  );
}
