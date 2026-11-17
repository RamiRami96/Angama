import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { useVisibility } from "@/shared/lib";

import { toLocalDateTime } from "../model/create-event.model";

type Props = {
  label: string;
  /** Local date-time, `YYYY-MM-DDTHH:mm` (or empty). */
  value: string;
  onChange: (v: string) => void;
  error?: string;
};

export function DateTimePickerField({ label, value, onChange, error }: Props) {
  const { visible, show, hide } = useVisibility();

  const dateValue = value ? new Date(value) : undefined;
  const displayText = dateValue
    ? dateValue.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      "  " +
      dateValue.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null;

  const handleConfirm = (date: Date) => {
    hide();
    onChange(toLocalDateTime(date));
  };

  return (
    <View style={{ gap: 6 }}>
      <Text className="text-white/70 text-xs font-semibold uppercase tracking-widest">{label}</Text>
      <Pressable
        onPress={show}
        className="bg-white/15 rounded-2xl px-4 active:opacity-70"
        style={{ height: 52, flexDirection: "row", alignItems: "center", gap: 10 }}
      >
        <Ionicons name="calendar-outline" size={18} color="rgba(255,255,255,0.5)" />
        <Text style={{ color: displayText ? "#fff" : "rgba(255,255,255,0.35)", fontSize: 14 }}>
          {displayText ?? "Select date & time"}
        </Text>
      </Pressable>
      {error && <Text className="text-red-300 text-xs ml-1">{error}</Text>}
      <DateTimePickerModal
        isVisible={visible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hide}
        minimumDate={new Date()}
        date={dateValue ?? new Date()}
      />
    </View>
  );
}
