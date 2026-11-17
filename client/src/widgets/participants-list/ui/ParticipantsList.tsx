import { Text, View } from "react-native";

import type { Participant } from "@/entities/participation";

import { ParticipantRow } from "@/features/manage-participants";

type Props = {
  participants: Participant[];
  eventName?: string;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
};

// Interim (Task 8): Task 11 splits requested vs confirmed sections.
export function ParticipantsList({ participants, eventName, onApprove, onReject }: Props) {
  return (
    <View className="mx-4 mb-4 bg-white/15 rounded-3xl px-4">
      <Text className="text-xs font-semibold text-white/60 uppercase tracking-widest pt-4 pb-1">
        {eventName ? `Requests — ${eventName}` : "Requests"}
      </Text>
      {participants.length === 0 ? (
        <View className="py-4">
          <Text className="text-white/40 text-sm text-center">No pending requests</Text>
        </View>
      ) : (
        participants.map((p) => (
          <ParticipantRow
            key={p.userId}
            name={p.user.name}
            onApprove={() => onApprove(p.userId)}
            onReject={() => onReject(p.userId)}
          />
        ))
      )}
    </View>
  );
}
