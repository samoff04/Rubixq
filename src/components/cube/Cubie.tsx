"use client";

import { Color } from "@/types/cube";
import Sticker from "./Sticker";

interface CubieProps {
  position: [number, number, number];
  colors: {
    front?: Color;
    back?: Color;
    top?: Color;
    bottom?: Color;
    left?: Color;
    right?: Color;
  };
}

export default function Cubie({
  position,
  colors,
}: CubieProps) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.94, 0.94, 0.94]} />
        <meshStandardMaterial
          color="#080b12"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {colors.front && (
        <Sticker
          color={colors.front}
          position={[0, 0, 0.481]}
          rotation={[0, 0, 0]}
        />
      )}

      {colors.back && (
        <Sticker
          color={colors.back}
          position={[0, 0, -0.481]}
          rotation={[0, Math.PI, 0]}
        />
      )}

      {colors.top && (
        <Sticker
          color={colors.top}
          position={[0, 0.481, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      )}

      {colors.bottom && (
        <Sticker
          color={colors.bottom}
          position={[0, -0.481, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      )}

      {colors.left && (
        <Sticker
          color={colors.left}
          position={[-0.481, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      )}

      {colors.right && (
        <Sticker
          color={colors.right}
          position={[0.481, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
      )}
    </group>
  );
}