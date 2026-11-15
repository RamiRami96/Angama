import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useClubQuery } from "@/entities/club";
import { useCurrentUser } from "@/entities/user";
import { useApplyToClubMutation } from "@/features/apply-to-club";
import { useDeleteClubMutation } from "@/features/delete-club";

import { ClubDetail } from "./ClubDetail";
import { useClubDetailModals } from "../model/useClubDetailModals";
import { useClubMembers } from "../model/useClubMembers";
import { useClubStatus } from "../model/useClubStatus";
import { useClubUserRelation } from "../model/useClubUserRelation";

type Props = {
  id: string;
  onBack: () => void;
};

export function ClubDetailContainer({ id, onBack }: Props) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const insets = useSafeAreaInsets();
  const { data: club } = useClubQuery(id);
  const applyMutation = useApplyToClubMutation();
  const deleteMutation = useDeleteClubMutation();
  const { successVisible, setSuccessVisible, warnVisible, setWarnVisible, deleteVisible, setDeleteVisible } = useClubDetailModals();

  if (!club) return null;

  const { isHost, alreadyApplied } = useClubUserRelation(club, currentUser);
  const { status, canApply, applyLabel } = useClubStatus(club);
  const { membersRatio, spotsLeft } = useClubMembers(club);

  const handleApply = async () => {
    await applyMutation.mutateAsync(club.id);
    router.replace("/(main)/clubs");
  };

  const handleApplyPress = () => {
    if (alreadyApplied) {
      setWarnVisible(true);
    } else {
      setSuccessVisible(true);
    }
  };

  const handleConfirm = () => {
    setSuccessVisible(false);
    void handleApply();
  };

  const handleDelete = async () => {
    setDeleteVisible(false);
    await deleteMutation.mutateAsync(club.id);
    router.replace("/(main)/clubs");
  };

  return (
    <ClubDetail
      club={club}
      insets={insets}
      isHost={isHost}
      status={status}
      canApply={canApply}
      membersRatio={membersRatio}
      spotsLeft={spotsLeft}
      applyLabel={applyLabel}
      successVisible={successVisible}
      warnVisible={warnVisible}
      deleteVisible={deleteVisible}
      onBack={onBack}
      onApplyPress={handleApplyPress}
      onConfirm={handleConfirm}
      onDelete={() => void handleDelete()}
      onWarnClose={() => setWarnVisible(false)}
      onDeleteOpen={() => setDeleteVisible(true)}
      onDeleteClose={() => setDeleteVisible(false)}
    />
  );
}
