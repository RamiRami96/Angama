import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMyParticipationsQuery } from "@/entities/participation";
import { MyParticipationsList } from "@/widgets/my-events";

// Interim (Task 8): Task 11 adds the "Organized by Me" section and actions.
export function MyEventsPage() {
  const { top } = useSafeAreaInsets();
  const { data, refetch } = useMyParticipationsQuery();

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: top + 16, paddingHorizontal: 16, paddingBottom: 16 }}>
        <Text className="text-white text-3xl font-bold">My Events</Text>
      </View>
      <MyParticipationsList participations={data ?? []} onRefresh={refetch} />
    </ScrollView>
  );
}
