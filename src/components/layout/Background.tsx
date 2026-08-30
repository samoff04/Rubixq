"use client";

export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#03050a]">
      <div className="absolute left-[15%] top-[5%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.07] blur-[150px]" />

      <div className="absolute bottom-[5%] right-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/[0.07] blur-[150px]" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:50px_50px]" />
    </div>
  );
}