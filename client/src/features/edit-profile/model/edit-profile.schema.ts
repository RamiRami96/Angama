import { z } from "zod";

import { updateProfileSchema, type UpdateProfileDto } from "@/shared/contracts";

/** What the form holds: plain strings, empty means "not set". */
export const editProfileFormSchema = z
  .object({
    name: z.string(),
    city: z.string(),
    about: z.string(),
    avatarUrl: z.string(),
  })
  .transform((v): z.input<typeof updateProfileSchema> => ({
    name: v.name,
    city: v.city,
    // Empty clears the field on the server (`null`); the contract rules apply after.
    about: v.about.trim() === "" ? null : v.about,
    avatarUrl: v.avatarUrl.trim() === "" ? null : v.avatarUrl.trim(),
  }))
  .pipe(updateProfileSchema);

export type EditProfileFormValues = z.input<typeof editProfileFormSchema>;
export type EditProfileData = UpdateProfileDto;
