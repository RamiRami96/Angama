import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Event } from "@/entities/event";
import { CancelEventModal } from "@/features/cancel-event";
import { RequestSentModal } from "@/features/request-participation";
import { BrandGradient } from "@/shared/ui";

import { useEventDetail } from "../model/useEventDetail";

import { EventActions } from "./EventActions";
import { EventHeader } from "./EventHeader";
import { EventInfoCard } from "./EventInfoCard";

type Props = {
  event: Event;
  onBack: () => void;
};

export function EventDetail({ event, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { action, request, cancel, publish, onEdit } = useEventDetail(event);

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
          onRequest={request.onRequestPress}
          onEdit={onEdit}
          onPublish={publish.onPublish}
          onCancelEvent={cancel.onCancelOpen}
        />
      </ScrollView>

      <RequestSentModal
        visible={request.successVisible}
        eventName={event.name}
        onConfirm={request.onConfirm}
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
