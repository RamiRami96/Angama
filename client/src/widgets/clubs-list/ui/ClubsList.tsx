import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Clubs } from "./Clubs";
import { useClubs } from "../model/useClubs";
import { useClubSearch } from "../model/useClubSearch";

export function ClubsList() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { clubs, isRefetching, refetch } = useClubs();

  const { searchQuery, setSearchQuery, filteredClubs } = useClubSearch(clubs);

  const handleCreateClub = () => router.push("/clubs/create");

  const handlePressClub = (id: string) => {
    if (!clubs.find((c) => c.id === id)) {
      Alert.alert("Club Not Found", "This club no longer exists or has been deleted.");
      return;
    }
    router.push(`/clubs/${id}`);
  };

  return (
    <Clubs
      clubs={filteredClubs}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      top={top}
      bottom={bottom}
      onPressClub={handlePressClub}
      onCreateClub={handleCreateClub}
      refreshing={isRefetching}
      onRefresh={refetch}
    />
  );
}
