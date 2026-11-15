import { useRouter } from "expo-router";

import { useCreateClubMutation } from "../model/useCreateClubMutation";

import { useCreateClubForm } from "../model/useCreateClubForm";

import { CreateClub } from "./CreateClub";

export function CreateClubContainer() {
  const router = useRouter();
  const createClubMutation = useCreateClubMutation();
  const { fields, errors, handleChange, validate } = useCreateClubForm();

  const handleSubmit = () => {
    const data = validate();
    if (!data) return;
    createClubMutation.mutate(data, { onSuccess: () => router.replace("/(main)/clubs") });
  };

  return (
    <CreateClub
      fields={fields}
      errors={errors}
      isLoading={createClubMutation.isPending}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onBack={() => router.back()}
    />
  );
}
