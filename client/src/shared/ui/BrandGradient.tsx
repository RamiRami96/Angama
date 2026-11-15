import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps } from "react";

import { brandGradient } from "@/shared/config";

type Props = Omit<ComponentProps<typeof LinearGradient>, "colors" | "start" | "end"> & {
  /** Left-to-right instead of the default top-left to bottom-right. */
  horizontal?: boolean;
};

/** The app's brand gradient. Pass layout via `style`/`children` as for any view. */
export function BrandGradient({ horizontal, ...props }: Props) {
  return (
    <LinearGradient
      colors={brandGradient}
      start={{ x: 0, y: 0 }}
      end={horizontal ? { x: 1, y: 0 } : { x: 1, y: 1 }}
      {...props}
    />
  );
}
