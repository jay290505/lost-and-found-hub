"use client";

import React from 'react';

type StatsProps = {
  total: number;
  found: number;
  lost: number;
};

export function StatsPanel({ total, found, lost }: StatsProps) {
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
  <StatCard label="Uploaded" value={total} accent="from-slate-300 to-slate-500" />
        <StatCard label="Found" value={found} accent="from-emerald-400 to-emerald-600" />
        <StatCard label="Lost" value={lost} accent="from-rose-400 to-rose-600" />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="relative flex-1 min-w-0 group">
      {/* Colored blurred shadow that appears on hover. It's positioned behind the card content. */}
      <div className={`absolute inset-0 rounded-2xl ${accent} opacity-0 filter blur-3xl transform scale-95 transition-all duration-300 group-hover:opacity-60`} aria-hidden="true" />

      <div className={`transform-gpu transition-transform duration-300 will-change-transform group-hover:scale-[1.02] relative z-10`}>
        <div
          className={`rounded-2xl p-6 bg-gradient-to-br ${accent} shadow-[0_10px_30px_rgba(0,0,0,0.18)]`}> 
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/90">{label}</p>
              <div className="mt-3 text-4xl font-extrabold text-white leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">{value}</div>
            </div>
            <div className="ml-4 w-20 h-20 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center transform perspective-1000 rotate-y-6 shadow-[inset_0_2px_6px_rgba(255,255,255,0.03)]">
              {/* Decorative 3D cube-ish element */}
              <div className="w-12 h-12 bg-white/20 rounded-sm transform rotate-x-12 rotate-y-12 shadow-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsPanel;
