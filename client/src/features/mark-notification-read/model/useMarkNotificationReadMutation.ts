import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Notification } from "@/entities/notification";
import { queryKeys } from "@/shared/api";
import { notifyError } from "@/shared/lib";

import { markAllNotificationsRead, markNotificationRead } from "../api/mark-notification-read";

/** Marks one notification read. The list is updated in place right away. */
export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: (id) => {
      queryClient.setQueryData<Notification[]>(queryKeys.notifications.all, (list) =>
        list?.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
    // Failure is not worth an alert (the user is navigating away): the
    // invalidation below restores the server state either way.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onError: notifyError("Couldn't mark notifications read"),
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(queryKeys.notifications.all, (list) =>
        list?.map((n) => ({ ...n, read: true })),
      );
      queryClient.setQueryData(queryKeys.notifications.unreadCount, 0);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });
}
