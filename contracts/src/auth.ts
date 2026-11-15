import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  dateOfBirth: z.iso.date('Use format YYYY-MM-DD'),
});

// Sign-in only requires a non-empty password: the length rule applies when an
// account is created, and must not lock out accounts that predate it.
export const signInSchema = z.object({
  email: z.email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type SignUpDto = z.infer<typeof signUpSchema>;
export type SignInDto = z.infer<typeof signInSchema>;
