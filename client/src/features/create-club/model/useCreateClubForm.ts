import { useState } from "react";

import { EMPTY_CLUB_FIELDS } from "../config/create-club.const";

import {
  CreateClubData,
  CreateClubErrors,
  CreateClubFields,
  createClubSchema,
} from "./create-club.model";

export function useCreateClubForm() {
  const [fields, setFields] = useState<CreateClubFields>(EMPTY_CLUB_FIELDS);
  const [errors, setErrors] = useState<CreateClubErrors>({});

  const handleChange = (key: keyof CreateClubFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  /** Returns the parsed payload, or null (and sets field errors) when invalid. */
  const validate = (): CreateClubData | null => {
    const result = createClubSchema.safeParse(fields);
    if (result.success) {
      setErrors({});
      return result.data;
    }
    const next: CreateClubErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof CreateClubFields;
      next[key] ??= issue.message;
    }
    setErrors(next);
    return null;
  };

  return { fields, errors, handleChange, validate };
}
