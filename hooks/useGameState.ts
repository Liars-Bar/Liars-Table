"use client";

import { useReadContract, useAccount } from "wagmi";
import { CONTRACT_ADDRESS, LIARS_BAR_ABI } from "@/config/wagmi";
import { GamePhase } from "@/types/game";
import type { GameInfo, LastPlay, PlayerInfo } from "@/types/game";

const POLL_INTERVAL = 3000;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function useGameState(gameId: bigint) {
  const { address } = useAccount();

  const { data: rawGameInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "getGameInfo",
    args: [gameId],
    query: { refetchInterval: POLL_INTERVAL },
  });

  const { data: rawPlayers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "getPlayers",
    args: [gameId],
    query: { refetchInterval: POLL_INTERVAL },
  });

  const { data: rawLastPlay } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "getLastPlay",
    args: [gameId],
    query: { refetchInterval: POLL_INTERVAL },
  });

  const { data: rawMyInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "getPlayerInfo",
    args: address ? [gameId, address] : undefined,
    query: {
      refetchInterval: POLL_INTERVAL,
      enabled: !!address,
    },
  });

  // Parse game info
  const gameInfo: GameInfo | null = rawGameInfo
    ? {
        phase: Number((rawGameInfo as readonly unknown[])[0]) as GamePhase,
        playerCount: Number((rawGameInfo as readonly unknown[])[1]),
        aliveCount: Number((rawGameInfo as readonly unknown[])[2]),
        stakeAmount: (rawGameInfo as readonly unknown[])[3] as bigint,
        stakeToken: (rawGameInfo as readonly unknown[])[4] as string,
        totalPot: (rawGameInfo as readonly unknown[])[5] as bigint,
        currentClaimType: Number((rawGameInfo as readonly unknown[])[6]),
        currentPlayer: (rawGameInfo as readonly unknown[])[7] as string,
        roundNumber: (rawGameInfo as readonly unknown[])[8] as bigint,
        turnDeadline: (rawGameInfo as readonly unknown[])[9] as bigint,
      }
    : null;

  // Parse players
  const players: string[] = (rawPlayers as readonly string[] | undefined)
    ? [...(rawPlayers as readonly string[])]
    : [];

  // Parse last play
  const lastPlay: LastPlay | null = rawLastPlay
    ? {
        player: (rawLastPlay as readonly unknown[])[0] as string,
        cardCount: Number((rawLastPlay as readonly unknown[])[1]),
        claimedType: Number((rawLastPlay as readonly unknown[])[2]),
      }
    : null;

  const hasLastPlay = lastPlay && lastPlay.player !== ZERO_ADDRESS;

  // Parse my info
  const myInfo: PlayerInfo | null = rawMyInfo
    ? {
        alive: (rawMyInfo as readonly unknown[])[0] as boolean,
        cardCount: Number((rawMyInfo as readonly unknown[])[1]),
        isCurrentTurn: (rawMyInfo as readonly unknown[])[2] as boolean,
      }
    : null;

  // Am I in this game?
  const isPlayer = address
    ? players.some((p) => p.toLowerCase() === address.toLowerCase())
    : false;

  return {
    gameInfo,
    players,
    lastPlay: hasLastPlay ? lastPlay : null,
    myInfo,
    address,
    isPlayer,
  };
}
