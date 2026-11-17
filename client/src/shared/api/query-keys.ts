import type { ListEventsQuery, MyEventsQuery } from "@/shared/contracts";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  events: {
    all: ["events"] as const,
    /** Prefix of every `list(filters)` key. */
    lists: ["events", "list"] as const,
    list: (filters: ListEventsQuery = {}) => ["events", "list", filters] as const,
    detail: (id: string) => ["events", "detail", id] as const,
    participants: (id: string) => ["events", "participants", id] as const,
  },
  users: {
    preferences: ["users", "me", "preferences"] as const,
    /** Prefix of both `myEvents(role)` keys. */
    myEventsAll: ["users", "me", "events"] as const,
    myEvents: (role: MyEventsQuery["role"]) => ["users", "me", "events", role] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
  catalog: ["catalog"] as const,
};
