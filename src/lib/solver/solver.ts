import {
  CubeState,
  Move,
} from "@/types/cube";

import {
  applyPhysicalMove,
  createPhysicalCube,
  physicalCubeToState,
} from "@/lib/cube/physicalCube";

import { createSolvedCube } from "@/lib/cube/cubeState";

const inverseMove = (move: Move): Move => {
  if (move.endsWith("2")) {
    return move;
  }

  if (move.endsWith("'")) {
    return move[0] as Move;
  }

  return `${move[0]}'` as Move;
};

const isSolved = (
  cube: CubeState
): boolean => {
  const solved = createSolvedCube();

  const faces = [
    "U",
    "D",
    "L",
    "R",
    "F",
    "B",
  ] as const;

  return faces.every((face) =>
    cube[face].every((row, rowIndex) =>
      row.every(
        (color, colIndex) =>
          color ===
          solved[face][rowIndex][colIndex]
      )
    )
  );
};

export const solveCube = (
  cube: CubeState,
  history: Move[] = []
): Move[] => {
  if (isSolved(cube)) {
    return [];
  }

  if (history.length === 0) {
    return [];
  }

  const solution = [...history]
    .reverse()
    .map(inverseMove);

  let physical = createPhysicalCube();

  for (const move of history) {
    physical = applyPhysicalMove(
      physical,
      move
    );
  }

  for (const move of solution) {
    physical = applyPhysicalMove(
      physical,
      move
    );
  }

  const solvedState =
    physicalCubeToState(physical);

  if (!isSolved(solvedState)) {
    return [];
  }

  return solution;
};