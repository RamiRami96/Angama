import { z } from "zod";

export type CreateClubFields = {
  name: string;
  description: string;
  location: string;
  startDate: string;
  maxMembers: string;
};

export const createClubSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim(),
  location: z.string().trim(),
  startDate: z
    .string()
    .min(1, "Pick a start date")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date")
    .transform((v) => new Date(v).toISOString()),
  maxMembers: z
    .string()
    .trim()
    .regex(/^\d+$/, "Enter a whole number")
    .transform(Number)
    .pipe(z.number().min(1, "Must be at least 1")),
});

export type CreateClubData = z.output<typeof createClubSchema>;
export type CreateClubErrors = Partial<Record<keyof CreateClubFields, string>>;
