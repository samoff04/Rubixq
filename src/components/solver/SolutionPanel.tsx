"use client";

import { Sparkles } from "lucide-react";
import { useCubeStore } from "@/store/cubeStore";

export default function SolutionPanel() {
  const solution = useCubeStore(
    (state) => state.solution
  );

  const currentStep = useCubeStore(
    (state) => state.currentStep
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles
            size={16}
            className="text-purple-400"
          />

          <h3 className="font-semibold">
            Solution
          </h3>
        </div>

        {solution.length > 0 && (
          <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-2.5 py-1 text-[10px] font-semibold text-purple-300">
            {solution.length} MOVES
          </span>
        )}
      </div>

      <div className="flex min-h-[62px] flex-wrap items-center gap-2">
        {solution.length === 0 ? (
          <p className="text-xs text-slate-500">
            Press Solve to generate the solution.
          </p>
        ) : (
          solution.map((move, index) => (
            <span
              key={`${move}-${index}`}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                index === currentStep - 1
                  ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.15)]"
                  : "border-white/10 bg-white/[0.04] text-slate-300"
              }`}
            >
              {move}
            </span>
          ))
        )}
      </div>
    </div>
  );
}