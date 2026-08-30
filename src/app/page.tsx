"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  BarChart3,
  Sparkles,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import CubeControls from "@/components/controls/CubeControls";
import SolutionPanel from "@/components/solver/SolutionPanel";
import SolverControls from "@/components/solver/SolverControls";
import { useCubeStore } from "@/store/cubeStore";

const Cube3D = dynamic(
  () => import("@/components/cube/Cube3D"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center bg-[#050913] text-sm text-slate-500">
        Loading 3D cube...
      </div>
    ),
  }
);

export default function Home() {
  const history = useCubeStore(
    (state) => state.history
  );

  const solution = useCubeStore(
    (state) => state.solution
  );

  const currentStep = useCubeStore(
    (state) => state.currentStep
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#03050a] text-white">
      <Background />

      <Header />

      <section className="mx-auto max-w-[1450px] px-5 pb-16 pt-14 lg:px-8 lg:pt-16">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="mb-10 text-center"
        >
          <div className="mb-5 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Rubixq Intelligence
            </span>
          </div>

          <h2 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Solve it.
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Move by move.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Explore an interactive 3D Rubik&apos;s Cube,
            scramble it, generate a solution and visualize
            every move.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_370px]">
          <div className="space-y-5">
            <GlassCard className="relative overflow-hidden p-2">
              <Cube3D />
            </GlassCard>

            <div className="grid gap-5 md:grid-cols-2">
              <GlassCard>
                <SolutionPanel />
              </GlassCard>

              <GlassCard>
                <SolverControls />
              </GlassCard>
            </div>
          </div>

          <div className="space-y-5">
            <GlassCard>
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">
                    Cube Controls
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Manipulate the cube state
                  </p>
                </div>

                <Sparkles
                  size={20}
                  className="text-cyan-300"
                />
              </div>

              <CubeControls />
            </GlassCard>

            <GlassCard>
              <div className="mb-4 flex items-center gap-2">
                <BarChart3
                  size={16}
                  className="text-cyan-300"
                />

                <h3 className="font-semibold">
                  Statistics
                </h3>
              </div>

              <div className="grid grid-cols-2 divide-x divide-white/10 border-y border-white/10 py-5 text-center">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-cyan-400">
                    Total Moves
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {history.length}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-cyan-400">
                    Current Step
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {currentStep}{" "}
                    <span className="text-sm text-slate-500">
                      / {solution.length}
                    </span>
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>
    </main>
  );
}