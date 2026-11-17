import { useLocalSearchParams, useRouter } from "expo-router";

import { useEventQuery } from "@/entities/event";
import { EventDetail } from "@/widgets/event-details";

export function EventDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: event } = useEventQuery(id);

  if (!event) return null;

  return <EventDetail event={event} onBack={() => router.back()} />;
}
