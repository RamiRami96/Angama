import { useRouter } from "expo-router";

import { useCreateEventMutation } from "../model/useCreateEventMutation";

import { useCreateEventForm } from "../model/useCreateEventForm";

import { CreateEvent } from "./CreateEvent";

export function CreateEventContainer() {
  const router = useRouter();
  const createEventMutation = useCreateEventMutation();
  const { fields, errors, handleChange, validate } = useCreateEventForm();

  const handleSubmit = () => {
    const data = validate();
    if (!data) return;
    createEventMutation.mutate(data, { onSuccess: () => router.replace("/(main)/events") });
  };

  return (
    <CreateEvent
      fields={fields}
      errors={errors}
      isLoading={createEventMutation.isPending}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onBack={() => router.back()}
    />
  );
}
