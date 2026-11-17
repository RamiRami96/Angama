import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useEventQuery } from "@/entities/event";
import { EventFormScreen, eventToFormFields } from "@/features/create-event";
import { toUpdateEventDto, useUpdateEventMutation } from "@/features/edit-event";
import { BrandGradient } from "@/shared/ui";

export function EditEventPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: event } = useEventQuery(id);
  const updateMutation = useUpdateEventMutation();

  if (!event) {
    return (
      <BrandGradient style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#fff" />
        </View>
      </BrandGradient>
    );
  }

  return (
    <EventFormScreen
      // Re-initialise the form if a different event is opened.
      key={event.id}
      title="Edit Event"
      initialFields={eventToFormFields(event)}
      categoryLocked
      submitting={updateMutation.isPending}
      actions={[
        {
          label: "Save changes",
          onSubmit: (dto) =>
            updateMutation.mutate(
              { id: event.id, data: toUpdateEventDto(dto) },
              { onSuccess: () => router.back() },
            ),
        },
      ]}
      onBack={() => router.back()}
    />
  );
}
