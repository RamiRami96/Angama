export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  clubs: {
    all: ["clubs"] as const,
    detail: (id: string) => ["clubs", id] as const,
    applicants: (clubId: string) => ["clubs", clubId, "applicants"] as const,
  },
  users: {
    myApplications: ["users", "me", "applications"] as const,
  },
};
