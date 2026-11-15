import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .optional(),
  // http(s) only (no javascript:, data: ...). `null` removes the avatar.
  avatarUrl: z
    .url({ protocol: /^https?$/, error: 'Invalid avatar URL' })
    .nullable()
    .optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
