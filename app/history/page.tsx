"use client";

import { motion } from "motion/react";

const TEASER = [
  { icon: "🎴", label: "Round won", detail: "Called a bluff on Ace", tone: "text-cipher" },
  { icon: "🔫", label: "Survived", detail: "Chamber came up empty", tone: "text-blue-400" },
  { icon: "🏆", label: "Table taken", detail: "Claimed 120 USDC pot", tone: "text-blue-300" },
];

export default function History() {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-130px)] px-6 py-16">
      <motion.span
        initial={{ scale: 0, y: -10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="text-5xl mb-4"
      >
        📜
      </motion.span>
      <h1 className="font-display text-brass-gradient text-4xl mb-2">
        Game History
      </h1>
      <p className="text-smoke mb-10 text-center max-w-md">
        Every hand you&apos;ve played, every liar you&apos;ve called — recorded
        on-chain. Full history is <span className="text-cipher">coming soon</span>.
      </p>

      <div className="w-full max-w-lg glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-navy-900/40 backdrop-blur-[2px]">
          <span className="rounded-full border border-brass/30 bg-navy-900/70 px-4 py-1.5 text-xs uppercase tracking-widest text-brass">
            Coming soon
          </span>
        </div>
        <div className="space-y-3">
          {TEASER.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex items-center gap-3 rounded-xl bg-navy-800/60 px-4 py-3 border border-brass/10"
            >
              <span className="text-xl">{r.icon}</span>
              <div className="flex flex-col">
                <span className={`text-sm font-semibold ${r.tone}`}>{r.label}</span>
                <span className="text-smoke text-xs">{r.detail}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
