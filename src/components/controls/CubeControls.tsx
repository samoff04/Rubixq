"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCcw,
  RotateCw,
  Shuffle,
  Sparkles,
} from "lucide-react";

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

const icons: Record<string, React.ReactNode> = {
  U: <ArrowUp size={14} />,
  "U'": <ArrowUp size={14} />,
  D: <ArrowDown size={14} />,
  "D'": <ArrowDown size={14} />,
  L: <ArrowLeft size={14} />,
  "L'": <ArrowLeft size={14} />,
  R: <ArrowRight size={14} />,
  "R'": <ArrowRight size={14} />,
  F: <RotateCw size={14} />,
  "F'": <RotateCcw size={14} />,
  B: <RotateCw size={14} />,
  "B'": <RotateCcw size={14} />,
};

export default function CubeControls() {
  const queueMove = useCubeStore(
    (state) => state.queueMove
  );

  const scramble = useCubeStore(
    (state) => state.scramble
  );

  const reset = useCubeStore(
    (state) => state.reset
  );

  const undo = useCubeStore(
    (state) => state.undo
  );

  const redo = useCubeStore(
    (state) => state.redo
  );

  const generateSolution = useCubeStore(
    (state) => state.generateSolution
  );

  const isAnimating = useCubeStore(
    (state) => state.isAnimating
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={isAnimating}
          onClick={scramble}
          className="control-button"
        >
          <Shuffle size={15} />
          Scramble
        </button>

        <button
          disabled={isAnimating}
          onClick={generateSolution}
          className="control-button"
        >
          <Sparkles size={15} />
          Solve
        </button>

        <button
          disabled={isAnimating}
          onClick={undo}
          className="control-button"
        >
          <RotateCcw size={15} />
          Undo
        </button>

        <button
          disabled={isAnimating}
          onClick={redo}
          className="control-button"
        >
          <RotateCw size={15} />
          Redo
        </button>

        <button
          disabled={isAnimating}
          onClick={reset}
          className="control-button col-span-2"
        >
          <RotateCcw size={15} />
          Reset
        </button>
      </div>

      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Cube Moves
        </p>

        <div className="grid grid-cols-3 gap-2">
          {moves.map((move) => (
            <button
              key={move}
              disabled={isAnimating}
              onClick={() => queueMove(move)}
              className="control-button min-h-[40px]"
            >
              {icons[move] ?? null}
              {move}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}