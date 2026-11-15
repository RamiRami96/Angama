import { useLocalSearchParams, useRouter } from "expo-router";

import { useClubQuery } from "@/entities/club";
import { ClubDetail } from "@/widgets/club-details";

export function ClubDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: club } = useClubQuery(id);

  if (!club) return null;

  return <ClubDetail club={club} onBack={() => router.back()} />;
}
