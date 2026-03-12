"use client";

import { useState, useEffect } from "react";
import { useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, LIARS_BAR_ABI } from "@/config/wagmi";

interface TurnTimerProps {
  turnDeadline: bigint;
  gameId: bigint;
  isActive: boolean;
  showForceTimeout?: boolean;
}

export default function TurnTimer({
  turnDeadline,
  gameId,
  isActive,
  showForceTimeout = true,
}: TurnTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const { writeContract, isPending } = useWriteContract();

  useEffect(() => {
    if (!isActive || turnDeadline === BigInt(0)) return;

    const update = () => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const remaining = turnDeadline > now ? Number(turnDeadline - now) : 0;
      setSecondsLeft(remaining);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [turnDeadline, isActive]);

  if (!isActive) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  let colorClass = "text-cream";
  if (secondsLeft < 15) colorClass = "text-red-500 animate-pulse";
  else if (secondsLeft < 60) colorClass = "text-yellow-400";

  const canForceTimeout = secondsLeft === 0;

  const handleForceTimeout = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: LIARS_BAR_ABI,
      functionName: "forceTurnTimeout",
      args: [gameId],
      value: parseEther("0.005"),
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`font-mono text-lg font-bold ${colorClass}`}>
        {timeStr}
      </div>
      {showForceTimeout && canForceTimeout && (
        <button
          onClick={handleForceTimeout}
          disabled={isPending}
          className="bg-red-500/80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-500 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isPending ? "Forcing..." : "Force Timeout"}
        </button>
      )}
    </div>
  );
}
