"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

import { useCubeStore } from "@/store/cubeStore";

export default function SolverControls() {
  const previous = useCubeStore(
    (state) => state.previousStep
  );

  const next = useCubeStore(
    (state) => state.nextStep
  );

  const playSolution = useCubeStore(
    (state) => state.playSolution
  );

  const pauseSolution = useCubeStore(
    (state) => state.pauseSolution
  );

  const restart = useCubeStore(
    (state) => state.restartSolution
  );

  const currentStep = useCubeStore(
    (state) => state.currentStep
  );

  const solution = useCubeStore(
    (state) => state.solution
  );

  const solutionPlaying = useCubeStore(
    (state) => state.solutionPlaying
  );

  const isComplete =
    currentStep >= solution.length;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        {solutionPlaying ? (
          <Pause
            size={16}
            className="text-cyan-300"
          />
        ) : (
          <Play
            size={16}
            className="text-cyan-300"
          />
        )}

        <h3 className="font-semibold">
          Solution Playback
        </h3>
      </div>

      <div className="flex gap-2">
        <button
          onClick={restart}
          className="icon-button"
        >
          <RotateCcw size={15} />
        </button>

        <button
          onClick={previous}
          disabled={
            currentStep === 0 ||
            solutionPlaying
          }
          className="icon-button"
        >
          <ChevronLeft size={17} />
        </button>

        <button
          onClick={
            solutionPlaying
              ? pauseSolution
              : playSolution
          }
          disabled={
            isComplete ||
            solution.length === 0
          }
          className="flex flex-1 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {solutionPlaying ? (
            <Pause
              size={17}
              fill="currentColor"
            />
          ) : (
            <Play
              size={17}
              fill="currentColor"
            />
          )}
        </button>

        <button
          onClick={next}
          disabled={
            currentStep >= solution.length ||
            solutionPlaying
          }
          className="icon-button"
        >
          <ChevronRight size={17} />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-[11px] text-slate-500">
          Step {currentStep} / {solution.length}
        </span>

        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
            style={{
              width:
                solution.length > 0
                  ? `${Math.min(
                      (currentStep /
                        solution.length) *
                        100,
                      100
                    )}%`
                  : "0%",
            }}
          />
        </div>
      </div>
    </div>
  );
}