import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import type { Event } from "@/entities/event";
import { GradientButton } from "@/shared/ui";

import { getClosedLabel, type EventAction } from "../model/event-status";

type Props = {
  event: Event;
  action: EventAction;
  isRequesting: boolean;
  isPublishing: boolean;
  isCancelling: boolean;
  isCancellingParticipation: boolean;
  onRequest: () => void;
  onEdit: () => void;
  onPublish: () => void;
  onCancelEvent: () => void;
  /** Withdraw the viewer's pending request or approved participation. */
  onCancelParticipation: () => void;
};

const NONE_LABEL: Partial<Record<NonNullable<Event["myParticipation"]>, string>> = {
  REJECTED: "Request declined",
  CANCELLED: "Participation cancelled",
  ATTENDED: "Attended",
  NO_SHOW: "Missed",
};

function DisabledPill({ label, icon }: { label: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      className="h-14 rounded-full bg-white/15 flex-row items-center justify-center gap-2"
    >
      {icon && <Ionicons name={icon} size={18} color="rgba(255,255,255,0.5)" />}
      <Text className="text-white/50 font-semibold text-base">{label}</Text>
    </View>
  );
}

function OutlineButton({
  label,
  icon,
  onPress,
  loading,
  danger,
  disabled,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  loading?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  const color = danger ? "#F87171" : "#fff";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading || !onPress}
      accessibilityRole="button"
      className={`h-14 rounded-full flex-row items-center justify-center gap-2 active:opacity-70 ${
        danger ? "bg-red-500/20" : "bg-white/15"
      } ${disabled || !onPress ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          <Ionicons name={icon} size={18} color={color} />
          <Text className={`font-semibold text-base ${danger ? "text-red-400" : "text-white"}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function EventActions({
  event,
  action,
  isRequesting,
  isPublishing,
  isCancelling,
  isCancellingParticipation,
  onRequest,
  onEdit,
  onPublish,
  onCancelEvent,
  onCancelParticipation,
}: Props) {
  switch (action) {
    case "edit":
      return (
        <View className="gap-3 pt-1">
          {event.status === "DRAFT" && (
            <GradientButton label="Publish" onPress={onPublish} loading={isPublishing} />
          )}
          <OutlineButton label="Edit Event" icon="create-outline" onPress={onEdit} />
          <OutlineButton
            label="Cancel Event"
            icon="close-circle-outline"
            onPress={onCancelEvent}
            loading={isCancelling}
            danger
          />
        </View>
      );
    case "request":
      return <GradientButton label="Request to Join" onPress={onRequest} loading={isRequesting} />;
    case "pending":
      return (
        <View className="gap-3 pt-1">
          <DisabledPill label="Request pending" icon="time-outline" />
          <OutlineButton
            label="Withdraw request"
            icon="exit-outline"
            onPress={onCancelParticipation}
            loading={isCancellingParticipation}
            danger
          />
        </View>
      );
    case "cancel-request":
      return (
        <View className="gap-2 pt-1">
          <View className="flex-row items-center justify-center gap-1.5">
            <Ionicons name="checkmark-circle" size={16} color="#86EFAC" />
            <Text className="text-green-300 text-sm font-medium">You&apos;re going</Text>
          </View>
          <OutlineButton
            label="Cancel participation"
            icon="exit-outline"
            onPress={onCancelParticipation}
            loading={isCancellingParticipation}
            danger
          />
        </View>
      );
    case "full":
      return <DisabledPill label="Event is full" icon="people-outline" />;
    case "closed":
      return (
        <DisabledPill label={getClosedLabel(event)} />
      );
    case "none": {
      const label = event.myParticipation ? NONE_LABEL[event.myParticipation] : undefined;
      return label ? <DisabledPill label={label} /> : null;
    }
  }
}
