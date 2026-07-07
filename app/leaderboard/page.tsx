"use client";

import { motion } from "motion/react";

const TEASER = [
  { rank: 1, medal: "🥇", name: "0x7c…d4a1", pot: "1,240 USDC" },
  { rank: 2, medal: "🥈", name: "0x19…8b2f", pot: "980 USDC" },
  { rank: 3, medal: "🥉", name: "0xa4…03e7", pot: "760 USDC" },
];

export default function Leaderboard() {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-130px)] px-6 py-16">
      <motion.span
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="text-5xl mb-4"
      >
        🏆
      </motion.span>
      <h1 className="font-display text-brass-gradient text-4xl mb-2">
        Leaderboard
      </h1>
      <p className="text-smoke mb-10 text-center max-w-md">
        The sharpest bluffers on-chain. Season rankings settle straight from the
        pot — <span className="text-cipher">coming soon</span>.
      </p>

      {/* Teaser podium (blurred preview) */}
      <div className="w-full max-w-lg glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-navy-900/40 backdrop-blur-[2px]">
          <span className="rounded-full border border-brass/30 bg-navy-900/70 px-4 py-1.5 text-xs uppercase tracking-widest text-brass">
            Season 1 · Coming soon
          </span>
        </div>
        <div className="space-y-3">
          {TEASER.map((r, i) => (
            <motion.div
              key={r.rank}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex items-center justify-between rounded-xl bg-navy-800/60 px-4 py-3 border border-brass/10"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{r.medal}</span>
                <span className="font-mono text-cream text-sm">{r.name}</span>
              </div>
              <span className="text-blue-400 font-semibold text-sm">{r.pot}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
