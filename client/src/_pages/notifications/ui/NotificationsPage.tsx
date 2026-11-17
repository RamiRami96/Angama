import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Placeholder tab (Task 8): Task 11 builds the notifications list.
export function NotificationsPage() {
  const { top } = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingTop: top + 16, paddingHorizontal: 16 }}>
      <Text className="text-white text-3xl font-bold">Alerts</Text>
    </View>
  );
}
