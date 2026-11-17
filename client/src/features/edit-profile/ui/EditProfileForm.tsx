import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";

import { useCurrentUser } from "@/entities/user";
import { toFormErrors } from "@/shared/lib";
import { Field, GradientButton } from "@/shared/ui";

import {
  editProfileFormSchema,
  type EditProfileData,
  type EditProfileFormValues,
} from "../model/edit-profile.schema";
import { useUpdateProfileMutation } from "../model/useUpdateProfileMutation";

const FIELDS = ["name", "city", "about", "avatarUrl"] as const;

export function EditProfileForm() {
  const user = useCurrentUser();
  const mutation = useUpdateProfileMutation();
  const [saved, setSaved] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormValues, unknown, EditProfileData>({
    resolver: standardSchemaResolver(editProfileFormSchema),
    defaultValues: {
      name: user?.name ?? "",
      city: user?.city ?? "",
      about: user?.about ?? "",
      avatarUrl: user?.avatarUrl ?? "",
    },
  });

  const onSubmit = async (data: EditProfileData) => {
    setSaved(false);
    try {
      const result = await mutation.mutateAsync(data);
      reset({
        name: result.name,
        city: result.city,
        about: result.about ?? "",
        avatarUrl: result.avatarUrl ?? "",
      });
      setSaved(true);
    } catch (err) {
      const { fields, root } = toFormErrors(err, FIELDS);
      for (const [name, message] of Object.entries(fields)) {
        setError(name as (typeof FIELDS)[number], { message });
      }
      if (root) setError("root", { message: root });
    }
  };

  return (
    <View className="bg-white/10 rounded-3xl p-4 gap-4">
      <Text className="text-white font-bold text-xl">Profile</Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Field
            label="Name"
            value={value}
            onChange={onChange}
            placeholder="Full name"
            autoCapitalize="words"
            error={errors.name?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, value } }) => (
          <Field
            label="City"
            value={value}
            onChange={onChange}
            placeholder="Where do you live?"
            autoCapitalize="words"
            error={errors.city?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="about"
        render={({ field: { onChange, value } }) => (
          <Field
            label="About"
            value={value}
            onChange={onChange}
            placeholder="Tell others about yourself"
            multiline
            error={errors.about?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="avatarUrl"
        render={({ field: { onChange, value } }) => (
          <Field
            label="Avatar URL"
            value={value}
            onChange={onChange}
            placeholder="https://..."
            autoCapitalize="none"
            error={errors.avatarUrl?.message}
          />
        )}
      />

      {errors.root?.message && (
        <Text className="text-red-300 text-sm text-center">{errors.root.message}</Text>
      )}
      {saved && (
        <Text className="text-white/80 text-sm text-center">Profile saved</Text>
      )}

      <GradientButton label="Save profile" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
    </View>
  );
}
