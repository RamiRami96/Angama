import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Event } from "@/entities/event";
import { CancelEventModal } from "@/features/cancel-event";
import {
  AlreadyRequestedModal,
  RequestSentModal,
} from "@/features/request-participation";
import { BrandGradient } from "@/shared/ui";

import { useEventDetail } from "../model/useEventDetail";

import { CancelButton } from "./CancelButton";
import { EventHeader } from "./EventHeader";
import { EventInfoCard } from "./EventInfoCard";
import { RequestButton } from "./RequestButton";

type Props = {
  event: Event;
  onBack: () => void;
};

export function EventDetail({ event, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { isOrganizer, request, cancel } = useEventDetail(event);
  const canCancel = event.status === "DRAFT" || event.status === "PUBLISHED";

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
        {!isOrganizer && (
          <RequestButton
            event={event}
            onPress={request.onRequestPress}
            loading={request.isRequesting}
          />
        )}
        {isOrganizer && canCancel && <CancelButton onPress={cancel.onCancelOpen} />}
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

      <AlreadyRequestedModal
        visible={request.warnVisible}
        eventName={event.name}
        onClose={request.onWarnClose}
      />
    </BrandGradient>
  );
}
