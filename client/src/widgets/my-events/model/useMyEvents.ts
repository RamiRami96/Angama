import { useRouter } from "expo-router";
import { useState } from "react";

import type { Event } from "@/entities/event";
import { useMyOrganizedEventsQuery, useMyParticipationsQuery } from "@/entities/participation";
import { useCancelEventMutation } from "@/features/cancel-event";
import { usePullToRefresh } from "@/shared/lib";

export type MyEventsSection = "organized" | "participating";

export function useMyEvents() {
  const router = useRouter();
  const [section, setSection] = useState<MyEventsSection>("organized");
  const organized = useMyOrganizedEventsQuery();
  const participating = useMyParticipationsQuery();
  const active = section === "organized" ? organized : participating;
  const pull = usePullToRefresh(active.refetch);

  const cancelMutation = useCancelEventMutation();
  const [cancelTarget, setCancelTarget] = useState<Event | null>(null);

  return {
    section,
    setSection,
    organized: organized.data ?? [],
    participating: participating.data ?? [],
    isLoading: active.isLoading,
    ...pull,
    onView: (id: string) => router.push(`/events/${id}`),
    onEdit: (id: string) => router.push(`/events/${id}/edit`),
    cancel: {
      target: cancelTarget,
      cancellingId: cancelMutation.isPending ? cancelMutation.variables : undefined,
      onOpen: (event: Event) => setCancelTarget(event),
      onClose: () => setCancelTarget(null),
      onConfirm: () => {
        if (cancelTarget) cancelMutation.mutate(cancelTarget.id);
        setCancelTarget(null);
      },
    },
  };
}
