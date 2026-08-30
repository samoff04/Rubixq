export type Face = "U" | "D" | "L" | "R" | "F" | "B";

export type Color =
  | "white"
  | "yellow"
  | "red"
  | "orange"
  | "blue"
  | "green";

export type Move = `${Face}` | `${Face}'` | `${Face}2`;

export type CubeState = Record<Face, Color[][]>;