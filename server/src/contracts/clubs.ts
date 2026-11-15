// GENERATED from /contracts/src by contracts/sync.mjs. Do not edit here.
import { z } from 'zod';

export const createClubSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim(),
  location: z.string().trim(),
  startDate: z.iso.datetime({ error: 'Invalid start date' }),
  maxMembers: z
    .number()
    .int('Max members must be a whole number')
    .min(1, 'Max members must be at least 1'),
});

export type CreateClubDto = z.infer<typeof createClubSchema>;
