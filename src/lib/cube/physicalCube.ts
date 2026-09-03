import {
  Color,
  CubeState,
  Face,
  Move,
} from "@/types/cube";

export type Axis = "x" | "y" | "z";

export interface PhysicalCubie {
  id: string;
  x: number;
  y: number;
  z: number;
  stickers: Partial<Record<Face, Color>>;
}

export const FACE_COLORS: Record<Face, Color> = {
  U: "white",
  D: "yellow",
  L: "orange",
  R: "red",
  F: "green",
  B: "blue",
};

export const FACE_VECTORS: Record<
  Face,
  [number, number, number]
> = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  L: [-1, 0, 0],
  R: [1, 0, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
};

export const MOVE_DATA: Record<
  Face,
  {
    axis: Axis;
    layer: number;
    direction: 1 | -1;
  }
> = {
  U: {
    axis: "y",
    layer: 1,
    direction: -1,
  },

  D: {
    axis: "y",
    layer: -1,
    direction: 1,
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

function rotateVector(
  vector: [number, number, number],
  axis: Axis,
  direction: number
): [number, number, number] {
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

function vectorToFace(
  vector: [number, number, number]
): Face {
  if (vector[1] === 1) return "U";
  if (vector[1] === -1) return "D";
  if (vector[0] === -1) return "L";
  if (vector[0] === 1) return "R";
  if (vector[2] === 1) return "F";

  return "B";
}

function rotateStickers(
  stickers: Partial<Record<Face, Color>>,
  axis: Axis,
  direction: number
): Partial<Record<Face, Color>> {
  const result: Partial<Record<Face, Color>> = {};

  for (const face of Object.keys(stickers) as Face[]) {
    const color = stickers[face];

    if (!color) continue;

    const vector = FACE_VECTORS[face];

    const rotated = rotateVector(
      vector,
      axis,
      direction
    );

    const newFace =
      vectorToFace(rotated);

    result[newFace] = color;
  }

  return result;
}

export function clonePhysicalCube(
  cubies: PhysicalCubie[]
): PhysicalCubie[] {
  return cubies.map((cubie) => ({
    id: cubie.id,
    x: cubie.x,
    y: cubie.y,
    z: cubie.z,
    stickers: {
      ...cubie.stickers,
    },
  }));
}

export function createPhysicalCube(): PhysicalCubie[] {
  const cubies: PhysicalCubie[] = [];

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const stickers: Partial<
          Record<Face, Color>
        > = {};

        if (y === 1) {
          stickers.U = FACE_COLORS.U;
        }

        if (y === -1) {
          stickers.D = FACE_COLORS.D;
        }

        if (x === -1) {
          stickers.L = FACE_COLORS.L;
        }

        if (x === 1) {
          stickers.R = FACE_COLORS.R;
        }

        if (z === 1) {
          stickers.F = FACE_COLORS.F;
        }

        if (z === -1) {
          stickers.B = FACE_COLORS.B;
        }

        cubies.push({
          id: `${x}:${y}:${z}`,
          x,
          y,
          z,
          stickers,
        });
      }
    }
  }

  return cubies;
}

function applyQuarterTurn(
  cubies: PhysicalCubie[],
  face: Face,
  direction: number
): PhysicalCubie[] {
  const data = MOVE_DATA[face];

  const next =
    clonePhysicalCube(cubies);

  for (const cubie of next) {
    const layerValue =
      data.axis === "x"
        ? cubie.x
        : data.axis === "y"
          ? cubie.y
          : cubie.z;

    if (layerValue !== data.layer) {
      continue;
    }

    const position =
      rotateVector(
        [cubie.x, cubie.y, cubie.z],
        data.axis,
        direction
      );

    cubie.x = position[0];
    cubie.y = position[1];
    cubie.z = position[2];

    cubie.stickers =
      rotateStickers(
        cubie.stickers,
        data.axis,
        direction
      );
  }

  return next;
}

export function applyPhysicalMove(
  cubies: PhysicalCubie[],
  move: Move
): PhysicalCubie[] {
  const face = move[0] as Face;

  const data = MOVE_DATA[face];

  if (move.endsWith("2")) {
    const first =
      applyQuarterTurn(
        cubies,
        face,
        data.direction
      );

    return applyQuarterTurn(
      first,
      face,
      data.direction
    );
  }

  const direction =
    move.endsWith("'")
      ? -data.direction
      : data.direction;

  return applyQuarterTurn(
    cubies,
    face,
    direction
  );
}

export function physicalCubeToState(
  cubies: PhysicalCubie[]
): CubeState {
  const cube: CubeState = {
    U: Array.from(
      { length: 3 },
      () =>
        Array(3).fill(
          FACE_COLORS.U
        ) as Color[]
    ),

    D: Array.from(
      { length: 3 },
      () =>
        Array(3).fill(
          FACE_COLORS.D
        ) as Color[]
    ),

    L: Array.from(
      { length: 3 },
      () =>
        Array(3).fill(
          FACE_COLORS.L
        ) as Color[]
    ),

    R: Array.from(
      { length: 3 },
      () =>
        Array(3).fill(
          FACE_COLORS.R
        ) as Color[]
    ),

    F: Array.from(
      { length: 3 },
      () =>
        Array(3).fill(
          FACE_COLORS.F
        ) as Color[]
    ),

    B: Array.from(
      { length: 3 },
      () =>
        Array(3).fill(
          FACE_COLORS.B
        ) as Color[]
    ),
  };

  for (const cubie of cubies) {
    for (const face of Object.keys(
      cubie.stickers
    ) as Face[]) {
      const color =
        cubie.stickers[face];

      if (!color) continue;

      let row = 1;
      let col = 1;

      switch (face) {
        case "F":
          row = 1 - cubie.y;
          col = cubie.x + 1;
          break;

        case "B":
          row = 1 - cubie.y;
          col = 1 - cubie.x;
          break;

        case "U":
          row =
            cubie.z === 1
              ? 0
              : cubie.z === -1
                ? 2
                : 1;

          col = cubie.x + 1;
          break;

        case "D":
          row =
            cubie.z === 1
              ? 0
              : cubie.z === -1
                ? 2
                : 1;

          col = cubie.x + 1;
          break;

        case "L":
          row = 1 - cubie.y;
          col = cubie.z + 1;
          break;

        case "R":
          row = 1 - cubie.y;
          col = 1 - cubie.z;
          break;
      }

      cube[face][row][col] = color;
    }
  }

  return cube;
}

export function physicalCubeEquals(
  a: PhysicalCubie[],
  b: PhysicalCubie[]
): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    const ca = a[i];
    const cb = b[i];

    if (
      ca.id !== cb.id ||
      ca.x !== cb.x ||
      ca.y !== cb.y ||
      ca.z !== cb.z
    ) {
      return false;
    }

    const faces: Face[] = [
      "U",
      "D",
      "L",
      "R",
      "F",
      "B",
    ];

    for (const face of faces) {
      if (
        ca.stickers[face] !==
        cb.stickers[face]
      ) {
        return false;
      }
    }
  }

  return true;
}