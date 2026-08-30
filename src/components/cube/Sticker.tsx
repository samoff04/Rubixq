"use client";

import { Color } from "@/types/cube";

interface StickerProps {
  color: Color;
  position: [number, number, number];
  rotation: [number, number, number];
}

const colors: Record<Color, string> = {
  white: "#f8fafc",
  yellow: "#facc15",
  red: "#ef4444",
  orange: "#f97316",
  blue: "#2563eb",
  green: "#16a34a",
};

export default function Sticker({
  color,
  position,
  rotation,
}: StickerProps) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[0.82, 0.82]} />
      <meshStandardMaterial
        color={colors[color]}
        roughness={0.3}
        metalness={0.15}
        side={2}
      />
    </mesh>
  );
}