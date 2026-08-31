import * as THREE from "three";

import {
  Color,
} from "@/types/cube";

interface CubieColors {
  front?: Color;
  back?: Color;
  top?: Color;
  bottom?: Color;
  left?: Color;
  right?: Color;
}

interface CubieProps {
  position: [
    number,
    number,
    number
  ];

  colors: CubieColors;
}

const COLOR_MAP: Record<
  Color,
  string
> = {
  white: "#ffffff",
  yellow: "#ffd900",
  orange: "#ff7a00",
  red: "#e53935",
  green: "#00a651",
  blue: "#246bff",
};

function Sticker({
  color,
  position,
  rotation,
}: {
  color?: Color;

  position: [
    number,
    number,
    number
  ];

  rotation: [
    number,
    number,
    number
  ];
}) {
  if (!color) {
    return null;
  }

  return (
    <mesh
      position={position}
      rotation={rotation}
    >
      <planeGeometry
        args={[
          0.82,
          0.82,
        ]}
      />

      <meshStandardMaterial
        color={
          COLOR_MAP[color]
        }
        roughness={0.35}
        metalness={0.05}
        side={
          THREE.DoubleSide
        }
      />
    </mesh>
  );
}

export default function Cubie({
  position,
  colors,
}: CubieProps) {
  return (
    <group
      position={position}
    >
      {/* Physical black cubie */}
      <mesh>
        <boxGeometry
          args={[
            0.94,
            0.94,
            0.94,
          ]}
        />

        <meshStandardMaterial
          color="#050505"
          roughness={0.7}
        />
      </mesh>

      {/* F */}
      <Sticker
        color={colors.front}
        position={[
          0,
          0,
          0.481,
        ]}
        rotation={[
          0,
          0,
          0,
        ]}
      />

      {/* B */}
      <Sticker
        color={colors.back}
        position={[
          0,
          0,
          -0.481,
        ]}
        rotation={[
          0,
          Math.PI,
          0,
        ]}
      />

      {/* U */}
      <Sticker
        color={colors.top}
        position={[
          0,
          0.481,
          0,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      />

      {/* D */}
      <Sticker
        color={colors.bottom}
        position={[
          0,
          -0.481,
          0,
        ]}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      />

      {/* R */}
      <Sticker
        color={colors.right}
        position={[
          0.481,
          0,
          0,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
      />

      {/* L */}
      <Sticker
        color={colors.left}
        position={[
          -0.481,
          0,
          0,
        ]}
        rotation={[
          0,
          -Math.PI / 2,
          0,
        ]}
      />
    </group>
  );
}