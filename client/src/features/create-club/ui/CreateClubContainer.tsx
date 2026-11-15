import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCreateClubMutation } from "../model/useCreateClubMutation";

import { useCreateClubForm } from "../model/useCreateClubForm";

import { CreateClub } from "./CreateClub";

export function CreateClubContainer() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const createClubMutation = useCreateClubMutation();
  const { fields, handleChange } = useCreateClubForm();

  const handleSubmit = async () => {
    await createClubMutation.mutateAsync({
      name: fields.name || "Untitled Club",
      description: fields.description,
      location: fields.location,
      startDate: fields.startDate
        ? new Date(fields.startDate).toISOString()
        : new Date().toISOString(),
      maxMembers: parseInt(fields.maxMembers, 10) || 20,
    });
    router.replace("/(main)/clubs");
  };

  return (
    <CreateClub
      fields={fields}
      isLoading={createClubMutation.isPending}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onBack={() => router.back()}
      top={top}
      bottom={bottom}
    />
  );
}
