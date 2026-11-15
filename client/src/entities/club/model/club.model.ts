import { z } from "zod";

const avatarUrl = z
  .string()
  .nullish()
  .transform((v) => v ?? undefined);

export const clubSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  location: z.string(),
  maxMembers: z.number(),
  currentMemberCount: z.number(),
  status: z.enum(["active", "cancelled", "full"]),
  startDate: z.string(),
  endDate: z.string(),
  createdAt: z.string(),
  host: z.object({ id: z.string(), name: z.string(), avatarUrl }),
  isRegistered: z.boolean(),
});

export const clubListSchema = z.array(clubSchema);

export type Club = z.infer<typeof clubSchema>;
