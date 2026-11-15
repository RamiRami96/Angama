import { z } from "zod";

import { createClubSchema as apiCreateClubSchema, type CreateClubDto } from "@/shared/contracts";

export type CreateClubFields = {
  name: string;
  description: string;
  location: string;
  startDate: string;
  maxMembers: string;
};

const isValidDate = (v: string) => !Number.isNaN(new Date(v).getTime());

/**
 * Form strings -> API payload. Field rules (required name, minimum members,
 * ...) come from the shared contract; this layer only converts the raw input.
 */
export const createClubSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    location: z.string(),
    startDate: z
      .string()
      .min(1, "Pick a start date")
      .refine(isValidDate, "Invalid date")
      .transform((v) => new Date(v).toISOString()),
    maxMembers: z.string().trim().regex(/^\d+$/, "Enter a whole number").transform(Number),
  })
  .pipe(apiCreateClubSchema);

export type CreateClubData = CreateClubDto;
export type CreateClubErrors = Partial<Record<keyof CreateClubFields, string>>;
