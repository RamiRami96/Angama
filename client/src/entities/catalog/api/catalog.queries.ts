import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { catalogService } from "./catalog.service";

// Seeded reference data: changes only with a deploy.
const CATALOG_STALE_MS = 24 * 60 * 60 * 1000;

export function useCatalog() {
  return useQuery({
    queryKey: queryKeys.catalog,
    queryFn: catalogService.get,
    staleTime: CATALOG_STALE_MS,
    gcTime: CATALOG_STALE_MS,
  });
}
