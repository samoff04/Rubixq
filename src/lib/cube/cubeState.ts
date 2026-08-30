import { CubeState } from "@/types/cube";

export function createSolvedCube(): CubeState {
  return {
    U: Array.from({ length: 3 }, () =>
      Array(3).fill("white")
    ),
    D: Array.from({ length: 3 }, () =>
      Array(3).fill("yellow")
    ),
    L: Array.from({ length: 3 }, () =>
      Array(3).fill("orange")
    ),
    R: Array.from({ length: 3 }, () =>
      Array(3).fill("red")
    ),
    F: Array.from({ length: 3 }, () =>
      Array(3).fill("green")
    ),
    B: Array.from({ length: 3 }, () =>
      Array(3).fill("blue")
    ),
  };
}

export function cloneCube(cube: CubeState): CubeState {
  return {
    U: cube.U.map((row) => [...row]),
    D: cube.D.map((row) => [...row]),
    L: cube.L.map((row) => [...row]),
    R: cube.R.map((row) => [...row]),
    F: cube.F.map((row) => [...row]),
    B: cube.B.map((row) => [...row]),
  };
}

export function isSolved(cube: CubeState): boolean {
  return Object.values(cube).every((face) => {
    const color = face[0][0];

    return face.every((row) =>
      row.every((cell) => cell === color)
    );
  });
}