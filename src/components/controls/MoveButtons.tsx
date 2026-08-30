"use client";

import { Move } from "@/types/cube";
import { useCubeStore } from "@/store/cubeStore";

const moves: Move[] = [
  "U",
  "U'",
  "U2",
  "D",
  "D'",
  "D2",
  "L",
  "L'",
  "L2",
  "R",
  "R'",
  "R2",
  "F",
  "F'",
  "F2",
  "B",
  "B'",
  "B2",
];

export default function MoveButtons() {
  const applyMove = useCubeStore(
    (state) => state.applyMove
  );

  return (
    <div className="grid grid-cols-3 gap-2">
      {moves.map((move) => (
        <button
          key={move}
          onClick={() => applyMove(move)}
          className="control-button"
        >
          {move}
        </button>
      ))}
    </div>
  );
}