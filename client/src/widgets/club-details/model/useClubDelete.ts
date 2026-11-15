import { useRouter } from "expo-router";
import { useState } from "react";

import type { Club } from "@/entities/club";
import { useDeleteClubMutation } from "@/features/delete-club";

export function useClubDelete(club: Club) {
  const router = useRouter();
  const deleteMutation = useDeleteClubMutation();
  const [deleteVisible, setDeleteVisible] = useState(false);

  const handleDelete = async () => {
    setDeleteVisible(false);
    await deleteMutation.mutateAsync(club.id);
    router.replace("/(main)/clubs");
  };

  return {
    deleteVisible,
    onDelete: () => void handleDelete(),
    onDeleteOpen: () => setDeleteVisible(true),
    onDeleteClose: () => setDeleteVisible(false),
  };
}
