"use client";

import { motion } from "motion/react";
import { ShieldLockIcon } from "@/components/icons/ShieldLockIcon";

interface PlayerSeatProps {
  address: string;
  isYou: boolean;
  isCurrentTurn: boolean;
  alive: boolean;
  cardCount: number;
  position: { top: string; left: string; transform: string };
}

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function PlayerSeat({
  address,
  isYou,
  isCurrentTurn,
  alive,
  cardCount,
  position,
}: PlayerSeatProps) {
  const activeTurn = isCurrentTurn && alive;

  return (
    <motion.div
      className="absolute z-10 flex flex-col items-center gap-1"
      style={{ top: position.top, left: position.left, transform: position.transform }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: alive ? 1 : 0.45, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      {/* Avatar */}
      <div className="relative">
        {/* pulsing brass halo on active turn */}
        {activeTurn && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: "0 0 0 2px rgba(212,165,72,0.9)" }}
            animate={{
              boxShadow: [
                "0 0 0 2px rgba(212,165,72,0.9), 0 0 12px 2px rgba(212,165,72,0.35)",
                "0 0 0 2px rgba(212,165,72,0.9), 0 0 26px 6px rgba(212,165,72,0.15)",
                "0 0 0 2px rgba(212,165,72,0.9), 0 0 12px 2px rgba(212,165,72,0.35)",
              ],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <div
          className={`
            relative w-16 h-16 rounded-full flex items-center justify-center
            bg-navy-800 blue-border transition-colors duration-300
            ${activeTurn ? "seat-active" : ""}
            ${!alive ? "grayscale" : ""}
          `}
        >
          {alive ? (
            <ShieldLockIcon size={24} className={isYou ? "drop-shadow-[0_0_8px_rgba(53,224,200,0.5)]" : ""} />
          ) : (
            <span className="text-2xl">💀</span>
          )}
        </div>
      </div>

      {/* Name + info */}
      <div className="flex flex-col items-center">
        <span className="text-cream text-xs font-mono">
          {truncateAddress(address)}
        </span>
        {isYou && (
          <span className="text-cipher text-[10px] font-semibold tracking-wide">
            (You)
          </span>
        )}
        {alive && (
          <div className="flex items-center gap-0.5 mt-0.5">
            {Array.from({ length: cardCount }, (_, i) => (
              <div
                key={i}
                className="w-3 h-4 rounded-[2px] card-back"
                style={{ transform: `rotate(${(i - Math.floor(cardCount / 2)) * 8}deg)` }}
              />
            ))}
          </div>
        )}
        {!alive && (
          <span className="text-[#e0384a]/80 text-[10px] font-semibold">
            Eliminated
          </span>
        )}
      </div>
    </motion.div>
  );
}
