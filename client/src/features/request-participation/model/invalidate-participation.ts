import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

/** The viewer's own participation changed: refresh every view showing it. */
export function invalidateParticipation(queryClient: QueryClient, eventId: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.events.lists });
  queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.users.myEvents("participant") });
}
