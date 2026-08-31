import { CubeState, Color, Face, Move } from "@/types/cube";
import { cloneCube } from "./cubeState";

type Vec3 = [number, number, number];

const faces: Face[] = ["U", "D", "L", "R", "F", "B"];

function rotateVector(
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

function getSticker(
  face: Face,
  row: number,
  col: number
): {
  position: Vec3;
  normal: Vec3;
} {
  switch (face) {
    case "F":
      return {
        position: [col - 1, 1 - row, 1],
        normal: [0, 0, 1],
      };

    case "B":
      return {
        position: [1 - col, 1 - row, -1],
        normal: [0, 0, -1],
      };

    case "U":
      return {
        position: [
          col - 1,
          1,
          row === 0 ? 1 : row === 2 ? -1 : 0,
        ],
        normal: [0, 1, 0],
      };

    case "D":
      return {
        position: [
          col - 1,
          -1,
          row === 0 ? -1 : row === 2 ? 1 : 0,
        ],
        normal: [0, -1, 0],
      };

    case "L":
      return {
        position: [-1, 1 - row, col - 1],
        normal: [-1, 0, 0],
      };

    case "R":
      return {
        position: [1, 1 - row, 1 - col],
        normal: [1, 0, 0],
      };
  }
}

function findSticker(
  position: Vec3,
  normal: Vec3
): {
  face: Face;
  row: number;
  col: number;
} {
  for (const face of faces) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const sticker = getSticker(
          face,
          row,
          col
        );

        if (
          sticker.position[0] === position[0] &&
          sticker.position[1] === position[1] &&
          sticker.position[2] === position[2] &&
          sticker.normal[0] === normal[0] &&
          sticker.normal[1] === normal[1] &&
          sticker.normal[2] === normal[2]
        ) {
          return {
            face,
            row,
            col,
          };
        }
      }
    }
  }

  throw new Error("Invalid sticker position");
}

const moveData: Record<
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

function rotateOnce(
  cube: CubeState,
  face: Face
): CubeState {
  const next = cloneCube(cube);
  const data = moveData[face];

  for (const sourceFace of faces) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const sticker = getSticker(
          sourceFace,
          row,
          col
        );

        const coordinate =
          data.axis === "x"
            ? sticker.position[0]
            : data.axis === "y"
              ? sticker.position[1]
              : sticker.position[2];

        if (coordinate !== data.layer) {
          continue;
        }

        const position = rotateVector(
          sticker.position,
          data.axis,
          data.direction
        );

        const normal = rotateVector(
          sticker.normal,
          data.axis,
          data.direction
        );

        const destination = findSticker(
          position,
          normal
        );

        next[destination.face][
          destination.row
        ][destination.col] =
          cube[sourceFace][row][col];
      }
    }
  }

  return next;
}

export function applyMove(
  cube: CubeState,
  move: Move
): CubeState {
  const face = move[0] as Face;

  if (move.endsWith("2")) {
    return rotateOnce(
      rotateOnce(cube, face),
      face
    );
  }

  if (move.endsWith("'")) {
    return rotateOnce(
      rotateOnce(
        rotateOnce(cube, face),
        face
      ),
      face
    );
  }

  return rotateOnce(cube, face);
}