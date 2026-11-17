import { z } from "zod";

const codeLabel = z.object({ code: z.string(), label: z.string() });
const codeName = z.object({ code: z.string(), name: z.string() });

/** Mirrors GET /catalog. */
export const catalogSchema = z.object({
  goals: z.array(codeLabel),
  interests: z.array(codeLabel),
  languages: z.array(codeName),
  categories: z.array(codeName),
});

export type Catalog = z.infer<typeof catalogSchema>;
