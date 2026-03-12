"use client";

import { formatUnits } from "viem";
import TurnTimer from "./TurnTimer";

interface TableNavInfoProps {
  gameId: string;
  stakeAmount: bigint | null;
  turnDeadline: bigint | null;
  isRoundActive: boolean;
}

export default function TableNavInfo({
  gameId,
  stakeAmount,
  turnDeadline,
  isRoundActive,
}: TableNavInfoProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Table ID badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-600/30 bg-navy-800/60">
        <span className="text-smoke text-xs uppercase tracking-wider">Table</span>
        <span className="text-cream font-mono text-sm font-semibold">#{gameId}</span>
      </div>

      {/* Turn timer */}
      <TurnTimer
        turnDeadline={turnDeadline ?? BigInt(0)}
        gameId={BigInt(gameId)}
        isActive={isRoundActive}
        showForceTimeout={false}
      />

      {/* Stake badge */}
      {stakeAmount !== null && (
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-blue-600/30 bg-navy-800/60">
          <span className="text-smoke text-xs">Stake</span>
          <span className="text-cream font-mono text-sm font-semibold">
            {formatUnits(stakeAmount, 6)} USDC
          </span>
        </div>
      )}
    </div>
  );
}
