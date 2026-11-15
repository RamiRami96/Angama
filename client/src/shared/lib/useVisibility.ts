import { useState } from "react";

export function useVisibility(initial = false) {
  const [visible, setVisible] = useState(initial);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return { visible, show, hide };
}
