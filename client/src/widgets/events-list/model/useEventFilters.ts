import { useMemo, useState } from "react";

import type { EventFilters } from "@/entities/event";
import type { EventCategoryCode } from "@/shared/contracts";
import { useDebouncedValue } from "@/shared/lib";

export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Discovery filter state. Typed text (search, city) is debounced before it
 * reaches `filters`, which is what the server query uses.
 */
export function useEventFilters() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState<EventCategoryCode | undefined>();
  const [language, setLanguage] = useState<string | undefined>();
  const [date, setDate] = useState<string | undefined>();

  const debouncedQ = useDebouncedValue(q, SEARCH_DEBOUNCE_MS);
  const debouncedCity = useDebouncedValue(city, SEARCH_DEBOUNCE_MS);

  const filters = useMemo<EventFilters>(
    () => ({ q: debouncedQ, category, language, city: debouncedCity, date }),
    [debouncedQ, category, language, debouncedCity, date],
  );

  /** Filters set in the collapsible panel (search excluded). */
  const activeCount = [category, language, city.trim(), date].filter(Boolean).length;

  const reset = () => {
    setCity("");
    setCategory(undefined);
    setLanguage(undefined);
    setDate(undefined);
  };

  return {
    q,
    city,
    category,
    language,
    date,
    filters,
    activeCount,
    setQ,
    setCity,
    setCategory,
    setLanguage,
    setDate,
    reset,
  };
}

export type EventFiltersState = ReturnType<typeof useEventFilters>;
