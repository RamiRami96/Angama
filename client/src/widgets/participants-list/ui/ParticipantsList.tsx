import type { ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { PARTICIPATION_STATUS_STYLE, type Participant } from "@/entities/participation";
import { ParticipantRow } from "@/features/manage-participants";

import { useParticipantsList } from "../model/useParticipantsList";

type Props = {
  eventId: string;
  /** Approving/rejecting only makes sense while the event is open. */
  canDecide: boolean;
};

/** The organizer's view: pending requests (approve / reject) and confirmed participants. */
export function ParticipantsList({ eventId, canDecide }: Props) {
  const { requested, confirmed, isLoading, isDeciding, onApprove, onReject } =
    useParticipantsList(eventId);

  if (isLoading) {
    return (
      <View className="bg-black/30 rounded-3xl p-6 items-center">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View className="gap-4">
      {canDecide && (
        <Section title={`Requests (${requested.length})`} empty="No pending requests">
          {requested.map((p) => (
            <ParticipantRow
              key={p.userId}
              name={p.user.name}
              disabled={isDeciding}
              onApprove={() => onApprove(p.userId)}
              onReject={() => onReject(p.userId)}
            />
          ))}
        </Section>
      )}
      <Section title={`Confirmed (${confirmed.length})`} empty="No confirmed participants yet">
        {confirmed.map((p) => (
          <ConfirmedRow key={p.userId} participant={p} />
        ))}
      </Section>
    </View>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: ReactNode[];
}) {
  return (
    <View className="bg-black/30 rounded-3xl px-4">
      <Text className="text-xs font-semibold text-white/60 uppercase tracking-widest pt-4 pb-1">
        {title}
      </Text>
      {children.length === 0 ? (
        <View className="py-4">
          <Text className="text-white/40 text-sm text-center">{empty}</Text>
        </View>
      ) : (
        children
      )}
    </View>
  );
}

function ConfirmedRow({ participant: p }: { participant: Participant }) {
  const s = PARTICIPATION_STATUS_STYLE[p.status];
  return (
    <View className="flex-row items-center gap-3 py-3 border-b border-white/10">
      <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
        <Text className="text-white text-sm font-bold">{p.user.name[0]?.toUpperCase()}</Text>
      </View>
      <Text className="text-white text-sm font-medium flex-1">{p.user.name}</Text>
      <View className={`px-2.5 py-1 rounded-full ${s.bg}`}>
        <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
      </View>
    </View>
  );
}
