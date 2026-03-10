"use client";

import { formatUnits } from "viem";
import { CARD_LABELS, CARD_SYMBOLS } from "@/types/game";
import type { GameInfo, LastPlay } from "@/types/game";

interface CenterInfoProps {
  gameInfo: GameInfo;
  lastPlay: LastPlay | null;
}

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function CenterInfo({ gameInfo, lastPlay }: CenterInfoProps) {
  const claimLabel = CARD_LABELS[gameInfo.currentClaimType] ?? "?";
  const claimSymbol = CARD_SYMBOLS[gameInfo.currentClaimType] ?? "?";

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-2 text-center">
        {/* Claim type */}
        <div className="bg-navy-900/80 rounded-xl px-5 py-3 blue-border backdrop-blur-sm">
          <p className="text-smoke text-[10px] uppercase tracking-widest mb-1">
            Claim Type
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-cream font-display">
              {claimSymbol}
            </span>
            <span className="text-lg text-blue-400 font-display">
              {claimLabel}
            </span>
          </div>
        </div>

        {/* Pot */}
        <div className="bg-navy-900/60 rounded-lg px-4 py-1.5 text-center">
          <span className="text-smoke text-[10px] uppercase tracking-wider">
            Pot{" "}
          </span>
          <span className="text-cream text-sm font-semibold">
            {formatUnits(gameInfo.totalPot, 6)} USDC
          </span>
        </div>

        {/* Round */}
        <span className="text-smoke/60 text-[10px]">
          Round {gameInfo.roundNumber.toString()}
        </span>

        {/* Last play */}
        {lastPlay && (
          <div className="bg-navy-900/60 rounded-lg px-3 py-1.5 mt-1">
            <p className="text-smoke text-[10px]">
              {truncateAddress(lastPlay.player)} played{" "}
              <span className="text-cream font-semibold">
                {lastPlay.cardCount} card{lastPlay.cardCount > 1 ? "s" : ""}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
