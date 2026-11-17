import { Text } from "react-native";

import { ConfirmModal } from "@/shared/ui";

type Props = {
  visible: boolean;
  eventName: string;
  /** A pending request is withdrawn; an approved spot is given up. */
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function CancelParticipationModal({ visible, eventName, pending, onConfirm, onCancel }: Props) {
  return (
    <ConfirmModal
      visible={visible}
      title={pending ? "Withdraw Request?" : "Cancel Participation?"}
      description={
        <Text className="text-white/60 text-sm text-center leading-5">
          {pending ? "This withdraws your request to join" : "You will give up your spot at"}
          {"\n"}
          <Text className="text-white font-semibold">{eventName}</Text>
          {"\n"}You won&apos;t be able to request again.
        </Text>
      }
      confirmLabel={pending ? "Yes, Withdraw" : "Yes, Cancel"}
      cancelLabel="Keep"
      icon={{ name: "exit-outline", color: "#F87171", bgClass: "bg-red-500/20" }}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
