/** Adds `code` when absent, removes it when present. Never duplicates, never mutates. */
export function toggleCode(list: string[], code: string): string[] {
  return list.includes(code) ? list.filter((c) => c !== code) : [...list, code];
}
