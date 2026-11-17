import { userPreferencesSchema, type UserPreferences } from "@/entities/user";
import { requestParsed } from "@/shared/api";
import { updateLanguagesSchema, updatePreferencesSchema } from "@/shared/contracts";

// Inputs are validated against the shared contract before they leave the app.
export function updatePreferences(data: { goals: string[]; interests: string[] }): Promise<UserPreferences> {
  return requestParsed("/users/me/preferences", userPreferencesSchema, {
    method: "PUT",
    body: JSON.stringify(updatePreferencesSchema.parse(data)),
  });
}

export function updateLanguages(data: { languages: { code: string; level: string }[] }): Promise<UserPreferences> {
  return requestParsed("/users/me/languages", userPreferencesSchema, {
    method: "PUT",
    body: JSON.stringify(updateLanguagesSchema.parse(data)),
  });
}
