import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Event } from "@/entities/event";
import { CancelEventModal } from "@/features/cancel-event";
import { CancelParticipationModal, RequestSentModal } from "@/features/request-participation";
import { BrandGradient } from "@/shared/ui";

import { useEventDetail } from "../model/useEventDetail";

import { EventActions } from "./EventActions";
import { EventHeader } from "./EventHeader";
import { EventInfoCard } from "./EventInfoCard";

type Props = {
  event: Event;
  onBack: () => void;
  /** Extra content below the actions (the organizer's participants list). */
  footer?: ReactNode;
};

export function EventDetail({ event, onBack, footer }: Props) {
  const insets = useSafeAreaInsets();
  const { action, request, cancel, leave, publish, onEdit } = useEventDetail(event);

  return (
    <BrandGradient style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 16,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <EventHeader event={event} onBack={onBack} />
        <EventInfoCard event={event} />
        <EventActions
          event={event}
          action={action}
          isRequesting={request.isRequesting}
          isPublishing={publish.isPublishing}
          isCancelling={cancel.isCancelling}
          isCancellingParticipation={leave.isCancelling}
          onRequest={request.onRequestPress}
          onEdit={onEdit}
          onPublish={publish.onPublish}
          onCancelEvent={cancel.onCancelOpen}
          onCancelParticipation={leave.onOpen}
        />
        {footer}
      </ScrollView>

      <RequestSentModal
        visible={request.successVisible}
        eventName={event.name}
        onConfirm={request.onConfirm}
      />

      <CancelParticipationModal
        visible={leave.visible}
        eventName={event.name}
        pending={event.myParticipation === "REQUESTED"}
        onConfirm={leave.onConfirm}
        onCancel={leave.onClose}
      />

      <CancelEventModal
        visible={cancel.cancelVisible}
        eventName={event.name}
        onConfirm={cancel.onCancelEvent}
        onCancel={cancel.onCancelClose}
      />
    </BrandGradient>
  );
}
