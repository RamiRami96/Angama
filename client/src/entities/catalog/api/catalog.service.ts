import { requestParsed } from "@/shared/api";

import { Catalog, catalogSchema } from "../model/catalog.model";

export const catalogService = {
  get: (): Promise<Catalog> => requestParsed("/catalog", catalogSchema),
};
