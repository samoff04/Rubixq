"use client";

import { Box } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-[#03060b]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/5 text-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.08)]">
            <Box size={23} strokeWidth={1.7} />
          </div>

          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white sm:text-base">
              Rubixq
            </h1>

            <p className="text-[11px] text-slate-500 sm:text-xs">
              Interactive 3D cube intelligence
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}