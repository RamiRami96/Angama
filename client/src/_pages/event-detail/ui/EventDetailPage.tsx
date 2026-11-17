import { useLocalSearchParams, useRouter } from "expo-router";

import { useEventQuery } from "@/entities/event";
import { useCurrentUser } from "@/entities/user";
import { EventDetail } from "@/widgets/event-details";
import { ParticipantsList } from "@/widgets/participants-list";

export function EventDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { data: event } = useEventQuery(id);

  if (!event) return null;

  // Drafts cannot have participants yet.
  const showParticipants = event.organizer.id === currentUser?.id && event.status !== "DRAFT";

  return (
    <EventDetail
      event={event}
      onBack={() => router.back()}
      footer={
        showParticipants ? (
          <ParticipantsList eventId={event.id} canDecide={event.status === "PUBLISHED"} />
        ) : null
      }
    />
  );
}
