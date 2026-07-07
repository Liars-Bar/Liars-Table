"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LobbyCard } from "@/components/LobbyCard";
import { CreateTableModal } from "@/components/CreateTableModal";
import { ShieldLockIcon } from "@/components/icons/ShieldLockIcon";

const WORDS = ["Bluff.", "Call.", "Survive."];

const PILLARS = [
  {
    symbol: "🔒",
    accent: "text-cipher",
    title: "Your hand is encrypted",
    body: "Cards are sealed on-chain with Inco FHE. No one — not even the contract — sees your hand until you choose to reveal.",
  },
  {
    symbol: "🎴",
    accent: "text-blue-400",
    title: "Provably fair deals",
    body: "Every shuffle and deal runs in a confidential smart contract. No trusted server, no hidden dealer, no house edge.",
  },
  {
    symbol: "🏆",
    accent: "text-blue-300",
    title: "Winner takes the pot",
    body: "Stake USDC, out-bluff the table, and claim the entire pot on-chain the moment the last liar falls.",
  },
];

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="relative flex flex-col items-center px-6 pt-16 pb-24 overflow-hidden">
      {/* Ambient embers */}
      <AmbientEmbers />

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center text-center mb-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs tracking-widest uppercase text-smoke"
        >
          <ShieldLockIcon size={16} className="animate-[cipher-pulse_2.4s_ease-in-out_infinite]" />
          Fully on-chain · Encrypted by{" "}
          <span className="text-cipher font-semibold">Inco FHE</span>
        </motion.div>

        <h1 className="font-display text-6xl md:text-8xl font-bold leading-[0.95] mb-5">
          {WORDS.map((w, i) => (
            <motion.span
              key={w}
              initial={{ opacity: 0, y: 40, rotateX: -40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.15 + i * 0.14, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-brass-gradient inline-block mr-4 last:mr-0"
            >
              {w}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-smoke text-lg max-w-lg mx-auto"
        >
          A high-stakes bluffing game played entirely on-chain — where your
          cards stay <span className="text-cipher">secret</span> and only your
          nerve is exposed.
        </motion.p>
      </section>

      {/* CTA CARDS */}
      <section className="relative z-10 flex flex-col md:flex-row gap-6 mb-24">
        <LobbyCard
          icon="♠"
          title="Create a Table"
          description="Start a new game and set the stakes"
          buttonText="Create Table"
          onClick={() => setShowCreateModal(true)}
        />
        <LobbyCard
          icon="♦"
          title="Join a Table"
          description="Enter an open table and test your nerve"
          buttonText="Join Table"
          href="/join-table"
        />
      </section>

      {/* PRIVACY STORY STRIP */}
      <section className="relative z-10 w-full max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-display text-3xl text-cream text-center mb-3"
        >
          Privacy is the <span className="text-cipher">whole game</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-smoke text-center max-w-xl mx-auto mb-10"
        >
          You can&apos;t bluff if everyone can see your cards. Inco&apos;s
          confidential computing keeps every hand encrypted on-chain — so the
          game is honest and the secrets are real.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-5">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-2xl p-6 flex flex-col gap-3"
            >
              <span className="text-3xl">{p.symbol}</span>
              <h3 className={`font-display text-lg ${p.accent}`}>{p.title}</h3>
              <p className="text-smoke text-sm leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {showCreateModal && (
          <CreateTableModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function AmbientEmbers() {
  // Deterministic positions (no Math.random → SSR-safe, no hydration drift)
  const embers = [
    { left: "12%", delay: "0s", dur: "7s", size: 4 },
    { left: "24%", delay: "2.4s", dur: "9s", size: 3 },
    { left: "38%", delay: "1.1s", dur: "8s", size: 5 },
    { left: "52%", delay: "3.2s", dur: "10s", size: 3 },
    { left: "63%", delay: "0.6s", dur: "7.5s", size: 4 },
    { left: "77%", delay: "2s", dur: "9.5s", size: 3 },
    { left: "88%", delay: "1.6s", dur: "8.5s", size: 5 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {embers.map((e, i) => (
        <span
          key={i}
          className="absolute bottom-1/4 rounded-full bg-ember blur-[1px]"
          style={{
            left: e.left,
            width: e.size,
            height: e.size,
            animation: `ember-rise ${e.dur} ease-in ${e.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
