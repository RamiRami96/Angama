import { Ionicons } from "@expo/vector-icons";

export type Route = {
  key: string;
  name: string;
};

export type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  /** Shows the unread-notifications count as a badge. */
  showsUnreadBadge?: boolean;
};

export const TABS: TabConfig[] = [
  { name: "events", label: "Events", icon: "compass-outline", iconActive: "compass" },
  { name: "my-events", label: "My Events", icon: "calendar-outline", iconActive: "calendar" },
  {
    name: "notifications",
    label: "Alerts",
    icon: "notifications-outline",
    iconActive: "notifications",
    showsUnreadBadge: true,
  },
  { name: "settings", label: "Profile", icon: "person-outline", iconActive: "person" },
];
