import { useClubQuery } from "@/entities/club";

import { ClubDetail } from "./ClubDetail";

type Props = {
  id: string;
  onBack: () => void;
};

export function ClubDetailContainer({ id, onBack }: Props) {
  const { data: club } = useClubQuery(id);

  if (!club) return null;

  return <ClubDetail club={club} onBack={onBack} />;
}
