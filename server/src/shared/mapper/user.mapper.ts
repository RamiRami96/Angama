/** Public shape of a user: never includes the password hash. */
export function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  dateOfBirth: Date;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    dateOfBirth: user.dateOfBirth.toISOString().split('T')[0],
    createdAt: user.createdAt.toISOString(),
  };
}
