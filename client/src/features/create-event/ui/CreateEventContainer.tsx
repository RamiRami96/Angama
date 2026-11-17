import { useRouter } from "expo-router";

import type { CreateEventDto } from "@/shared/contracts";

import { useCreateEventMutation } from "../model/useCreateEventMutation";

import { EventFormScreen } from "./EventFormScreen";

export function CreateEventContainer() {
  const router = useRouter();
  const createEventMutation = useCreateEventMutation();

  const create = (status: CreateEventDto["status"]) => (dto: CreateEventDto) =>
    createEventMutation.mutate(
      { ...dto, status },
      { onSuccess: (event) => router.replace(`/events/${event.id}`) },
    );

  return (
    <EventFormScreen
      title="Create Event"
      submitting={createEventMutation.isPending}
      actions={[
        { label: "Publish", onSubmit: create("PUBLISHED") },
        { label: "Save as draft", variant: "secondary", onSubmit: create("DRAFT") },
      ]}
      onBack={() => router.back()}
    />
  );
}
