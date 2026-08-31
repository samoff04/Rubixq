import {
  Color,
  Face,
  Move,
} from "@/types/cube";

export type Vec3 = [number, number, number];

export interface PhysicalSticker {
  normal: Vec3;
  color: Color;
}

export interface PhysicalCubie {
  id: string;
  position: Vec3;
  stickers: PhysicalSticker[];
}

const solvedColors: Record<
  Face,
  Color
> = {
  U: "white",
  D: "yellow",
  L: "orange",
  R: "red",
  F: "green",
  B: "blue",
};

export function rotateVector(
  vector: Vec3,
  axis: "x" | "y" | "z",
  direction: number
): Vec3 {
  const [x, y, z] = vector;

  if (axis === "x") {
    return direction === 1
      ? [x, -z, y]
      : [x, z, -y];
  }

  if (axis === "y") {
    return direction === 1
      ? [z, y, -x]
      : [-z, y, x];
  }

  return direction === 1
    ? [-y, x, z]
    : [y, -x, z];
}

export function getMoveData(
  move: Move
) {
  const face = move[0];

  const data: Record<
    Face,
    {
      axis: "x" | "y" | "z";
      layer: number;
      direction: number;
    }
  > = {
    U: {
      axis: "y",
      layer: 1,
      direction: 1,
    },
    D: {
      axis: "y",
      layer: -1,
      direction: -1,
    },
    L: {
      axis: "x",
      layer: -1,
      direction: 1,
    },
    R: {
      axis: "x",
      layer: 1,
      direction: -1,
    },
    F: {
      axis: "z",
      layer: 1,
      direction: -1,
    },
    B: {
      axis: "z",
      layer: -1,
      direction: 1,
    },
  };

  const result = data[face];

  const direction = move.endsWith("'")
    ? -result.direction
    : result.direction;

  const amount = move.endsWith("2")
    ? 2
    : 1;

  return {
    axis: result.axis,
    layer: result.layer,
    direction,
    angle:
      direction *
      Math.PI *
      0.5 *
      amount,
  };
}

export function createPhysicalCube(): PhysicalCubie[] {
  const result: PhysicalCubie[] = [];

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (
          x === 0 &&
          y === 0 &&
          z === 0
        ) {
          continue;
        }

        const stickers: PhysicalSticker[] = [];

        if (x === -1) {
          stickers.push({
            normal: [-1, 0, 0],
            color: solvedColors.L,
          });
        }

        if (x === 1) {
          stickers.push({
            normal: [1, 0, 0],
            color: solvedColors.R,
          });
        }

        if (y === -1) {
          stickers.push({
            normal: [0, -1, 0],
            color: solvedColors.D,
          });
        }

        if (y === 1) {
          stickers.push({
            normal: [0, 1, 0],
            color: solvedColors.U,
          });
        }

        if (z === -1) {
          stickers.push({
            normal: [0, 0, -1],
            color: solvedColors.B,
          });
        }

        if (z === 1) {
          stickers.push({
            normal: [0, 0, 1],
            color: solvedColors.F,
          });
        }

        result.push({
          id: `${x}-${y}-${z}`,
          position: [x, y, z],
          stickers,
        });
      }
    }
  }

  return result;
}

export function rotatePhysicalCube(
  cubies: PhysicalCubie[],
  move: Move
): PhysicalCubie[] {
  const data = getMoveData(move);

  const turns = move.endsWith("2")
    ? 2
    : 1;

  let result = cubies.map((cubie) => ({
    ...cubie,
    position: [...cubie.position] as Vec3,
    stickers: cubie.stickers.map(
      (sticker) => ({
        ...sticker,
        normal: [
          ...sticker.normal,
        ] as Vec3,
      })
    ),
  }));

  for (let turn = 0; turn < turns; turn++) {
    result = result.map((cubie) => {
      const coordinate =
        data.axis === "x"
          ? cubie.position[0]
          : data.axis === "y"
            ? cubie.position[1]
            : cubie.position[2];

      if (coordinate !== data.layer) {
        return cubie;
      }

      return {
        ...cubie,
        position: rotateVector(
          cubie.position,
          data.axis,
          data.direction
        ),
        stickers: cubie.stickers.map(
          (sticker) => ({
            ...sticker,
            normal: rotateVector(
              sticker.normal,
              data.axis,
              data.direction
            ),
          })
        ),
      };
    });
  }

  return result;
}