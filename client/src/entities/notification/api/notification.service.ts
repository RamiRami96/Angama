import { requestParsed } from "@/shared/api";

import {
  Notification,
  notificationListSchema,
  unreadCountSchema,
} from "../model/notification.model";

export const notificationsService = {
  getAll: (): Promise<Notification[]> => requestParsed("/notifications", notificationListSchema),

  getUnreadCount: async (): Promise<number> =>
    (await requestParsed("/notifications/unread-count", unreadCountSchema)).count,
};
