import { z } from "zod";

export const applicationStatusSchema = z.enum(["waiting", "approved", "rejected", "cancelled"]);

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export type Application = {
  userId: string;
  userName: string;
  clubId: string;
  clubName: string;
  status: ApplicationStatus;
};

export const applicantSchema = z.object({
  userId: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z
      .string()
      .nullish()
      .transform((v) => v ?? undefined),
  }),
  clubId: z.string(),
  status: applicationStatusSchema,
});

export const myApplicationSchema = z.object({
  clubId: z.string(),
  clubName: z.string(),
  status: applicationStatusSchema,
  registeredAt: z.string(),
  club: z.object({
    id: z.string(),
    name: z.string(),
    startDate: z.string(),
    location: z.string(),
  }),
});

export type Applicant = z.infer<typeof applicantSchema>;
export type MyApplication = z.infer<typeof myApplicationSchema>;
