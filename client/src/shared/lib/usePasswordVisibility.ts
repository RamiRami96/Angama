import { useState } from "react";

export function usePasswordVisibility(secureTextEntry?: boolean) {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  const toggleHidden = () => setHidden((h) => !h);

  return { hidden, toggleHidden };
}
