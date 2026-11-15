import { useState } from "react";

import { EMPTY_CLUB_FIELDS } from "../config/create-club.const";

import { CreateClubFields } from "./create-club.model";

export function useCreateClubForm() {
  const [fields, setFields] = useState<CreateClubFields>(EMPTY_CLUB_FIELDS);

  const handleChange = (key: keyof CreateClubFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  return { fields, handleChange };
}
