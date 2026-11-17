import type { LanguageLevel } from "@/shared/contracts";

export type LanguageEntry = { code: string; level: LanguageLevel };

export const DEFAULT_LANGUAGE_LEVEL: LanguageLevel = "B1";

/** Adds the language or updates its level. Keeps order, never duplicates. */
export function setLanguageLevel(
  list: LanguageEntry[],
  code: string,
  level: LanguageLevel,
): LanguageEntry[] {
  return list.some((l) => l.code === code)
    ? list.map((l) => (l.code === code ? { code, level } : l))
    : [...list, { code, level }];
}

export function removeLanguage(list: LanguageEntry[], code: string): LanguageEntry[] {
  return list.filter((l) => l.code !== code);
}
