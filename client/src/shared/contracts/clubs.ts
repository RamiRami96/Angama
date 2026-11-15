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

/** GET /clubs query string. `upcoming=true` hides clubs that already started. */
export const listClubsQuerySchema = z.object({
  upcoming: z.stringbool().optional(),
});

export type CreateClubDto = z.infer<typeof createClubSchema>;
export type ListClubsQuery = z.infer<typeof listClubsQuerySchema>;
