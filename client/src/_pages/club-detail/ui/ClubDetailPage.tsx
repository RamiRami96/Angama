import { useLocalSearchParams, useRouter } from "expo-router";

import { ClubDetailContainer } from "@/widgets/club-details";

export function ClubDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return <ClubDetailContainer id={id} onBack={() => router.back()} />;
}
