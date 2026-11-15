import Animated from "react-native-reanimated";

import { Particle } from "../config/particles.const";
import { useParticleAnimation } from "../model/useParticleAnimation";

type Props = { particle: Particle; screenHeight: number };

export function FloatingLetter({ particle, screenHeight }: Props) {
  const style = useParticleAnimation(particle, screenHeight);

  return (
    <Animated.Text
      style={[
        style,
        {
          position: "absolute",
          left: `${particle.x * 100}%` as `${number}%`,
          top: 0,
          fontSize: particle.size,
          color: "#fff",
          fontWeight: "bold",
        },
      ]}
    >
      {particle.char}
    </Animated.Text>
  );
}
