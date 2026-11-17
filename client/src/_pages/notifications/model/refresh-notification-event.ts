import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

/**
 * A notification means the event (or its participants) changed since it was
 * cached: refetch both before opening the detail screen.
 */
export function refreshNotificationEvent(queryClient: QueryClient, eventId: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.events.participants(eventId) });
}
