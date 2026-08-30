import { CubeState, Color, Face, Move } from "@/types/cube";
import { cloneCube } from "./cubeState";

function rotateFace(
  face: Color[][],
  clockwise = true
): Color[][] {
  const result: Color[][] = Array.from(
    { length: 3 },
    () => Array(3)
  );

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (clockwise) {
        result[col][2 - row] = face[row][col];
      } else {
        result[2 - col][row] = face[row][col];
      }
    }
  }

  return result;
}

function reverse(values: Color[]): Color[] {
  return [...values].reverse();
}

function getRow(
  cube: CubeState,
  face: Face,
  row: number
): Color[] {
  return [...cube[face][row]];
}

function setRow(
  cube: CubeState,
  face: Face,
  row: number,
  values: Color[]
) {
  cube[face][row] = [...values];
}

function getCol(
  cube: CubeState,
  face: Face,
  col: number
): Color[] {
  return cube[face].map((row) => row[col]);
}

function setCol(
  cube: CubeState,
  face: Face,
  col: number,
  values: Color[]
) {
  for (let i = 0; i < 3; i++) {
    cube[face][i][col] = values[i];
  }
}

function moveU(cube: CubeState): CubeState {
  const next = cloneCube(cube);

  next.U = rotateFace(cube.U);

  const f = getRow(cube, "F", 0);
  const r = getRow(cube, "R", 0);
  const b = getRow(cube, "B", 0);
  const l = getRow(cube, "L", 0);

  setRow(next, "F", 0, l);
  setRow(next, "R", 0, f);
  setRow(next, "B", 0, r);
  setRow(next, "L", 0, b);

  return next;
}

function moveD(cube: CubeState): CubeState {
  const next = cloneCube(cube);

  next.D = rotateFace(cube.D);

  const f = getRow(cube, "F", 2);
  const r = getRow(cube, "R", 2);
  const b = getRow(cube, "B", 2);
  const l = getRow(cube, "L", 2);

  setRow(next, "F", 2, r);
  setRow(next, "R", 2, b);
  setRow(next, "B", 2, l);
  setRow(next, "L", 2, f);

  return next;
}

function moveF(cube: CubeState): CubeState {
  const next = cloneCube(cube);

  next.F = rotateFace(cube.F);

  const u = getRow(cube, "U", 2);
  const r = getCol(cube, "R", 0);
  const d = getRow(cube, "D", 0);
  const l = getCol(cube, "L", 2);

  setRow(next, "U", 2, reverse(l));
  setCol(next, "R", 0, u);
  setRow(next, "D", 0, reverse(r));
  setCol(next, "L", 2, d);

  return next;
}

function moveB(cube: CubeState): CubeState {
  const next = cloneCube(cube);

  next.B = rotateFace(cube.B);

  const u = getRow(cube, "U", 0);
  const r = getCol(cube, "R", 2);
  const d = getRow(cube, "D", 2);
  const l = getCol(cube, "L", 0);

  setRow(next, "U", 0, r);
  setCol(next, "R", 2, reverse(d));
  setRow(next, "D", 2, l);
  setCol(next, "L", 0, reverse(u));

  return next;
}

function moveR(cube: CubeState): CubeState {
  const next = cloneCube(cube);

  next.R = rotateFace(cube.R);

  const u = getCol(cube, "U", 2);
  const f = getCol(cube, "F", 2);
  const d = getCol(cube, "D", 2);
  const b = getCol(cube, "B", 0);

  setCol(next, "U", 2, f);
  setCol(next, "F", 2, d);
  setCol(next, "D", 2, reverse(b));
  setCol(next, "B", 0, reverse(u));

  return next;
}

function moveL(cube: CubeState): CubeState {
  const next = cloneCube(cube);

  next.L = rotateFace(cube.L);

  const u = getCol(cube, "U", 0);
  const f = getCol(cube, "F", 0);
  const d = getCol(cube, "D", 0);
  const b = getCol(cube, "B", 2);

  setCol(next, "U", 0, reverse(b));
  setCol(next, "F", 0, u);
  setCol(next, "D", 0, f);
  setCol(next, "B", 2, reverse(d));

  return next;
}

function applyClockwise(
  cube: CubeState,
  face: Face
): CubeState {
  switch (face) {
    case "U":
      return moveU(cube);
    case "D":
      return moveD(cube);
    case "F":
      return moveF(cube);
    case "B":
      return moveB(cube);
    case "R":
      return moveR(cube);
    case "L":
      return moveL(cube);
  }
}

export function applyMove(
  cube: CubeState,
  move: Move
): CubeState {
  const face = move[0] as Face;

  if (move.endsWith("2")) {
    return applyClockwise(
      applyClockwise(cube, face),
      face
    );
  }

  if (move.endsWith("'")) {
    let result = cube;

    for (let i = 0; i < 3; i++) {
      result = applyClockwise(result, face);
    }

    return result;
  }

  return applyClockwise(cube, face);
}