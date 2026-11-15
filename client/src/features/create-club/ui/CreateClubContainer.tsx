import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCreateClubMutation } from "../model/useCreateClubMutation";

import { useCreateClubForm } from "../model/useCreateClubForm";

import { CreateClub } from "./CreateClub";

export function CreateClubContainer() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const createClubMutation = useCreateClubMutation();
  const { fields, errors, handleChange, validate } = useCreateClubForm();

  const handleSubmit = async () => {
    const data = validate();
    if (!data) return;
    await createClubMutation.mutateAsync(data);
    router.replace("/(main)/clubs");
  };

  return (
    <CreateClub
      fields={fields}
      errors={errors}
      isLoading={createClubMutation.isPending}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onBack={() => router.back()}
      top={top}
      bottom={bottom}
    />
  );
}
