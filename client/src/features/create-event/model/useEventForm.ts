import { useState } from "react";

import { EMPTY_EVENT_FIELDS } from "../config/create-event.const";

import {
  CreateEventDto,
  EventFormErrors,
  EventFormFields,
  createEventFormSchema,
  fieldOfIssue,
} from "./create-event.model";

export function useEventForm(initialFields: EventFormFields = EMPTY_EVENT_FIELDS) {
  const [fields, setFields] = useState<EventFormFields>(initialFields);
  const [errors, setErrors] = useState<EventFormErrors>({});

  const handleChange = <K extends keyof EventFormFields>(key: K, value: EventFormFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  /** Returns the parsed payload, or null (and sets field errors) when invalid. */
  const validate = (): CreateEventDto | null => {
    const result = createEventFormSchema.safeParse(fields);
    if (result.success) {
      setErrors({});
      return result.data;
    }
    const next: EventFormErrors = {};
    for (const issue of result.error.issues) {
      next[fieldOfIssue(issue.path)] ??= issue.message;
    }
    setErrors(next);
    return null;
  };

  return { fields, errors, handleChange, validate };
}
