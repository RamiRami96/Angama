import { ApiError } from "@/shared/api";

import { getErrorMessage } from "./notify-error";

export type FormErrors<K extends string> = {
  /** Server validation messages for fields the form actually has. */
  fields: Partial<Record<K, string>>;
  /** Anything that is not about a single field: bad credentials, offline, 5xx, ... */
  root?: string;
};

/**
 * Splits an error thrown by the API layer into per-field messages and a
 * form-level message, so a failed request is never pinned on the wrong input.
 */
export function toFormErrors<K extends string>(
  err: unknown,
  formFields: readonly K[],
): FormErrors<K> {
  const fields: Partial<Record<K, string>> = {};
  const unmatched: string[] = [];

  if (ApiError.is(err)) {
    for (const issue of err.errors) {
      const field = formFields.find((f) => f === issue.path);
      if (field) fields[field] ??= issue.message;
      else unmatched.push(issue.message);
    }
  }

  if (Object.keys(fields).length > 0) return { fields, root: unmatched[0] };
  return { fields, root: getErrorMessage(err) };
}
