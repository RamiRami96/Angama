import { Text } from "react-native";

import { ConfirmModal } from "@/shared/ui";

type Props = {
  visible: boolean;
  eventName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function CancelEventModal({ visible, eventName, onConfirm, onCancel }: Props) {
  return (
    <ConfirmModal
      visible={visible}
      title="Cancel Event?"
      description={
        <Text className="text-white/60 text-sm text-center leading-5">
          This will cancel{"\n"}
          <Text className="text-white font-semibold">{eventName}</Text>
          {"\n"}and notify its participants. It cannot be undone.
        </Text>
      }
      confirmLabel="Yes, Cancel"
      icon={{ name: "close-circle-outline", color: "#F87171", bgClass: "bg-red-500/20" }}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
