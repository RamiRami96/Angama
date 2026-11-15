import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .optional(),
  avatarUrl: z.url('Invalid avatar URL').optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
