"use client";

import { useRef, useEffect } from "react";
import { CARD_LABELS, CARD_SYMBOLS } from "@/types/game";
import type { GameInfo, LastPlay, EventLogEntry } from "@/types/game";

interface SidePanelProps {
  gameInfo: GameInfo;
  lastPlay: LastPlay | null;
  players: string[];
  eventLog: EventLogEntry[];
}

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const LOG_TYPE_COLORS: Record<EventLogEntry["type"], string> = {
  action: "text-cream",
  challenge: "text-red-400",
  elimination: "text-red-300",
  system: "text-blue-400",
  info: "text-smoke",
};

export default function SidePanel({
  gameInfo,
  lastPlay,
  eventLog,
}: SidePanelProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [eventLog.length]);

  const firedCount = gameInfo.playerCount - gameInfo.aliveCount;

  return (
    <div className="flex flex-col h-full">
      {/* STATS SECTION */}
      <div className="p-4 border-b border-blue-600/20 space-y-4 shrink-0">
        <h2 className="text-smoke text-[10px] uppercase tracking-widest font-semibold">
          Game Stats
        </h2>

        {/* Table Cards (current claim type) */}
        <div className="flex items-center justify-between">
          <span className="text-smoke text-xs">Table Cards</span>
          <div className="flex items-center gap-1.5">
            <span className="text-cream font-mono text-lg font-bold leading-none">
              {CARD_SYMBOLS[gameInfo.currentClaimType] ?? "?"}
            </span>
            <span className="text-blue-400 text-sm">
              {CARD_LABELS[gameInfo.currentClaimType] ?? "?"}
            </span>
          </div>
        </div>

        {/* Alive */}
        <div className="flex items-center justify-between">
          <span className="text-smoke text-xs">Alive</span>
          <div className="flex items-center gap-1">
            <span className="text-cream text-sm font-semibold">
              {gameInfo.aliveCount}
            </span>
            <span className="text-smoke text-xs">/ {gameInfo.playerCount}</span>
          </div>
        </div>

        {/* Bullet Remains (revolver chambers) */}
        <div>
          <span className="text-smoke text-xs block mb-2">Bullet Remains</span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 6 }, (_, i) => {
              const fired = i < firedCount;
              return (
                <div
                  key={i}
                  title={fired ? "Fired" : "Live"}
                  className={`w-5 h-5 rounded-full border-2 transition-colors ${
                    fired
                      ? "bg-red-500/80 border-red-400"
                      : "bg-navy-700/80 border-smoke/30"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Last Played */}
        <div>
          <span className="text-smoke text-xs block mb-1">Last Played</span>
          {lastPlay ? (
            <p className="text-xs leading-relaxed">
              <span className="text-cream font-mono">
                {truncateAddress(lastPlay.player)}
              </span>
              <span className="text-smoke"> played </span>
              <span className="text-blue-400 font-semibold">
                {lastPlay.cardCount} card{lastPlay.cardCount !== 1 ? "s" : ""}
              </span>
              <span className="text-smoke"> as </span>
              <span className="text-cream font-semibold">
                {CARD_LABELS[lastPlay.claimedType] ?? "?"}
              </span>
            </p>
          ) : (
            <p className="text-smoke/40 text-xs italic">No plays yet</p>
          )}
        </div>

        {/* Round */}
        <div className="flex items-center justify-between">
          <span className="text-smoke text-xs">Round</span>
          <span className="text-cream text-sm font-semibold">
            {gameInfo.roundNumber.toString()}
          </span>
        </div>
      </div>

      {/* EVENT LOG SECTION */}
      <div className="flex flex-col flex-1 min-h-0 p-4">
        <h2 className="text-smoke text-[10px] uppercase tracking-widest font-semibold mb-3 shrink-0">
          Event Log
        </h2>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {eventLog.length === 0 ? (
            <p className="text-smoke/40 text-xs italic">
              Waiting for game events...
            </p>
          ) : (
            eventLog.map((entry) => (
              <div key={entry.id} className="flex gap-2 items-start">
                <span className="text-smoke/40 text-[10px] font-mono mt-0.5 shrink-0">
                  {new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <span
                  className={`text-xs leading-relaxed ${LOG_TYPE_COLORS[entry.type]}`}
                >
                  {entry.message}
                </span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
