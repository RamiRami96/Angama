import { LinearGradient } from "expo-linear-gradient";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Club } from "@/entities/club";
import {
  AlreadyAppliedModal,
  ApplySuccessModal,
} from "@/features/apply-to-club";
import { DeleteClubModal } from "@/features/delete-club";

import { useClubDetail } from "../model/useClubDetail";

import { ApplyButton } from "./ApplyButton";
import { ClubHeader } from "./ClubHeader";
import { ClubInfoCard } from "./ClubInfoCard";
import { DeleteButton } from "./DeleteButton";

type Props = {
  club: Club;
  onBack: () => void;
};

export function ClubDetail({ club, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { isHost, apply, remove } = useClubDetail(club);

  return (
    <LinearGradient
      colors={["#06B6D4", "#4F46E5"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
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
        <ClubHeader club={club} onBack={onBack} />
        <ClubInfoCard club={club} />
        {!isHost && <ApplyButton club={club} onPress={apply.onApplyPress} />}
        {isHost && <DeleteButton onPress={remove.onDeleteOpen} />}
      </ScrollView>

      <ApplySuccessModal
        visible={apply.successVisible}
        clubName={club.name}
        onConfirm={apply.onConfirm}
      />

      <DeleteClubModal
        visible={remove.deleteVisible}
        clubName={club.name}
        onConfirm={remove.onDelete}
        onCancel={remove.onDeleteClose}
      />

      <AlreadyAppliedModal
        visible={apply.warnVisible}
        clubName={club.name}
        onClose={apply.onWarnClose}
      />
    </LinearGradient>
  );
}
