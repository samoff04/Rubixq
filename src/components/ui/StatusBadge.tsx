"use client";

interface StatusBadgeProps {
  label: string;
}

export default function StatusBadge({
  label,
}: StatusBadgeProps) {
  return (
    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
      {label}
    </span>
  );
}