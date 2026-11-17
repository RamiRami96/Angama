import { useState } from "react";

import { EMPTY_EVENT_FIELDS } from "../config/create-event.const";

import {
  CreateEventData,
  CreateEventErrors,
  CreateEventFields,
  createEventFormSchema,
  fieldOfIssue,
} from "./create-event.model";

export function useCreateEventForm() {
  const [fields, setFields] = useState<CreateEventFields>(EMPTY_EVENT_FIELDS);
  const [errors, setErrors] = useState<CreateEventErrors>({});

  const handleChange = (key: keyof CreateEventFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  /** Returns the parsed payload, or null (and sets field errors) when invalid. */
  const validate = (): CreateEventData | null => {
    const result = createEventFormSchema.safeParse(fields);
    if (result.success) {
      setErrors({});
      return result.data;
    }
    const next: CreateEventErrors = {};
    for (const issue of result.error.issues) {
      next[fieldOfIssue(issue.path)] ??= issue.message;
    }
    setErrors(next);
    return null;
  };

  return { fields, errors, handleChange, validate };
}
