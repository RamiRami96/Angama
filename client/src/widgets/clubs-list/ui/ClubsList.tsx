import { useRouter } from "expo-router";
import { Clubs } from "./Clubs";
import { useClubs } from "../model/useClubs";
import { useClubSearch } from "../model/useClubSearch";

export function ClubsList() {
  const router = useRouter();
  const { clubs, isRefetching, refetch } = useClubs();

  const { searchQuery, setSearchQuery, filteredClubs } = useClubSearch(clubs);

  const handleCreateClub = () => router.push("/clubs/create");

  const handlePressClub = (id: string) => router.push(`/clubs/${id}`);

  return (
    <Clubs
      clubs={filteredClubs}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onPressClub={handlePressClub}
      onCreateClub={handleCreateClub}
      refreshing={isRefetching}
      onRefresh={refetch}
    />
  );
}
