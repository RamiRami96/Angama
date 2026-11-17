/** Public shape of a user: never includes the password hash. */
export function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  city: string;
  about: string | null;
  dateOfBirth: Date;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    city: user.city,
    about: user.about,
    dateOfBirth: user.dateOfBirth.toISOString().split('T')[0],
    createdAt: user.createdAt.toISOString(),
  };
}
