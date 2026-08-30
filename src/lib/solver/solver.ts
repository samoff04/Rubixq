import { CubeState, Move } from "@/types/cube";

const inverseMove = (move: Move): Move => {
  if (move.endsWith("2")) {
    return move;
  }

  if (move.endsWith("'")) {
    return move[0] as Move;
  }

  return `${move}'` as Move;
};

export const solveCube = (
  _cube: CubeState,
  history: Move[] = []
): Move[] => {
  if (history.length === 0) {
    return [];
  }

  return [...history]
    .reverse()
    .map(inverseMove);
};