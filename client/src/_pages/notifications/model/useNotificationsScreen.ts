import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef } from "react";

import { notificationHref, useNotifications, type Notification } from "@/entities/notification";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/features/mark-notification-read";
import { usePullToRefresh } from "@/shared/lib";

const NO_NOTIFICATIONS: Notification[] = [];

export function useNotificationsScreen() {
  const router = useRouter();
  const { data, isLoading, refetch } = useNotifications();
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();
  const pull = usePullToRefresh(refetch);

  // Refresh when the tab is revisited; the first focus is the initial fetch.
  const focusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) refetch();
      focusedOnce.current = true;
    }, [refetch]),
  );

  const notifications = data ?? NO_NOTIFICATIONS;

  return {
    notifications,
    isLoading,
    hasUnread: notifications.some((n) => !n.read),
    isMarkingAll: markAllRead.isPending,
    ...pull,
    onPressNotification: (n: Notification) => {
      if (!n.read) markRead.mutate(n.id);
      router.push(notificationHref(n));
    },
    onMarkAllRead: () => markAllRead.mutate(),
  };
}
