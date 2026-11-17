import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { notificationsService } from "./notification.service";

const UNREAD_POLL_MS = 30_000;

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: notificationsService.getAll,
  });
}

/**
 * Unread count for the tab badge. No websockets: polled while mounted and
 * refetched whenever the app returns to the foreground.
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: notificationsService.getUnreadCount,
    refetchInterval: UNREAD_POLL_MS,
    refetchOnWindowFocus: "always",
  });
}
