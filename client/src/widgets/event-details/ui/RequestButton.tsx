import { Text, View } from "react-native";

import type { Event } from "@/entities/event";
import { GradientButton } from "@/shared/ui";

import { getEventStatus } from "../model/event-status";

type Props = {
  event: Event;
  onPress: () => void;
  loading?: boolean;
};

export function RequestButton({ event, onPress, loading }: Props) {
  const { canRequest, requestLabel } = getEventStatus(event);

  return (
    <View style={{ paddingTop: 4 }}>
      {canRequest ? (
        <GradientButton label={requestLabel} onPress={onPress} loading={loading} />
      ) : (
        <View className="h-14 rounded-full bg-white/15 items-center justify-center">
          <Text className="text-white/50 font-semibold text-base">{requestLabel}</Text>
        </View>
      )}
    </View>
  );
}
