"use client";

import { usePathname } from "next/navigation";
import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, LIARS_BAR_ABI } from "@/config/wagmi";
import { GamePhase } from "@/types/game";

const POLL_INTERVAL = 3000;

export function useTableNavInfo() {
  const pathname = usePathname();
  const match = pathname.match(/^\/table\/(\d+)$/);
  const gameIdStr = match ? match[1] : null;
  const gameIdBigInt = gameIdStr ? BigInt(gameIdStr) : undefined;

  const { data: rawGameInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "getGameInfo",
    args: gameIdBigInt !== undefined ? [gameIdBigInt] : undefined,
    query: {
      refetchInterval: POLL_INTERVAL,
      enabled: gameIdBigInt !== undefined,
    },
  });

  if (!gameIdStr) {
    return { gameId: null, stakeAmount: null, turnDeadline: null, isRoundActive: false };
  }

  const stakeAmount = rawGameInfo
    ? ((rawGameInfo as readonly unknown[])[3] as bigint)
    : null;

  const turnDeadline = rawGameInfo
    ? ((rawGameInfo as readonly unknown[])[9] as bigint)
    : null;

  const phase = rawGameInfo
    ? (Number((rawGameInfo as readonly unknown[])[0]) as GamePhase)
    : null;

  const isRoundActive = phase === GamePhase.RoundInProgress;

  return { gameId: gameIdStr, stakeAmount, turnDeadline, isRoundActive };
}
