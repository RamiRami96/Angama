import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "PARTICIPATION_REQUESTED",
  "PARTICIPATION_APPROVED",
  "PARTICIPATION_REJECTED",
  "EVENT_CANCELLED",
]);

/** Mirrors the server's `NotificationDto`. */
export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  eventId: z.string(),
  eventName: z.string(),
  actorName: z.string().nullable(),
  read: z.boolean(),
  createdAt: z.string(),
});

export const notificationListSchema = z.array(notificationSchema);

export const unreadCountSchema = z.object({ count: z.number() });

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;

/** Human-readable text for a notification. */
export function notificationText(n: Notification): string {
  switch (n.type) {
    case "PARTICIPATION_REQUESTED":
      return `${n.actorName ?? "Someone"} requested to join ${n.eventName}`;
    case "PARTICIPATION_APPROVED":
      return `Your request for ${n.eventName} was approved`;
    case "PARTICIPATION_REJECTED":
      return `Your request for ${n.eventName} was rejected`;
    case "EVENT_CANCELLED":
      return `${n.eventName} was cancelled`;
  }
}
