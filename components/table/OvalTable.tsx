"use client";

import { useReadContract, useAccount } from "wagmi";
import { CONTRACT_ADDRESS, LIARS_BAR_ABI } from "@/config/wagmi";
import PlayerSeat from "./PlayerSeat";
import CenterInfo from "./CenterInfo";
import GameOverlay from "./GameOverlay";
import type { GameInfo, LastPlay } from "@/types/game";

// Seat positions as { top, left, transform } for each player count
// Index 0 = current user (always at bottom center)
const SEAT_POSITIONS: Record<
  number,
  { top: string; left: string; transform: string }[]
> = {
  2: [
    { top: "82%", left: "50%", transform: "translate(-50%, -50%)" },
    { top: "8%", left: "50%", transform: "translate(-50%, -50%)" },
  ],
  3: [
    { top: "82%", left: "50%", transform: "translate(-50%, -50%)" },
    { top: "12%", left: "18%", transform: "translate(-50%, -50%)" },
    { top: "12%", left: "82%", transform: "translate(-50%, -50%)" },
  ],
  4: [
    { top: "82%", left: "50%", transform: "translate(-50%, -50%)" },
    { top: "45%", left: "5%", transform: "translate(-50%, -50%)" },
    { top: "8%", left: "50%", transform: "translate(-50%, -50%)" },
    { top: "45%", left: "95%", transform: "translate(-50%, -50%)" },
  ],
  5: [
    { top: "82%", left: "50%", transform: "translate(-50%, -50%)" },
    { top: "58%", left: "5%", transform: "translate(-50%, -50%)" },
    { top: "12%", left: "20%", transform: "translate(-50%, -50%)" },
    { top: "12%", left: "80%", transform: "translate(-50%, -50%)" },
    { top: "58%", left: "95%", transform: "translate(-50%, -50%)" },
  ],
};

interface OvalTableProps {
  gameInfo: GameInfo;
  players: string[];
  lastPlay: LastPlay | null;
  gameId: bigint;
}

export default function OvalTable({
  gameInfo,
  players,
  lastPlay,
  gameId,
}: OvalTableProps) {
  const { address } = useAccount();

  // Reorder players so current user is at index 0
  const reorderedPlayers = (() => {
    if (!address || players.length === 0) return players;
    const myIndex = players.findIndex(
      (p) => p.toLowerCase() === address.toLowerCase()
    );
    if (myIndex === -1) return players;
    return [...players.slice(myIndex), ...players.slice(0, myIndex)];
  })();

  const playerCount = reorderedPlayers.length;
  const positionKey = Math.max(2, playerCount) as 2 | 3 | 4 | 5;
  const positions = SEAT_POSITIONS[positionKey] ?? SEAT_POSITIONS[2];

  return (
    <div className="relative w-full max-w-4xl aspect-[4/3] mx-auto">
      {/* Table surface */}
      <div className="absolute inset-[8%] rounded-[50%] felt-table border-8 border-amber-900/50">
        {/* Center info */}
        <CenterInfo gameInfo={gameInfo} lastPlay={lastPlay} />

        {/* Phase overlays */}
        <GameOverlay
          phase={gameInfo.phase}
          gameId={gameId}
          totalPot={gameInfo.totalPot}
          currentPlayer={gameInfo.currentPlayer}
          aliveCount={gameInfo.aliveCount}
          myAddress={address}
        />
      </div>

      {/* Player seats (positioned relative to outer container) */}
      {reorderedPlayers.map((playerAddr, i) => {
        const isYou =
          address !== undefined &&
          playerAddr.toLowerCase() === address.toLowerCase();
        const isCurrentTurn =
          gameInfo.currentPlayer.toLowerCase() === playerAddr.toLowerCase();

        return (
          <PlayerSeatWithInfo
            key={playerAddr}
            gameId={gameId}
            playerAddr={playerAddr}
            isYou={isYou}
            isCurrentTurn={isCurrentTurn}
            position={positions[i] ?? positions[0]}
          />
        );
      })}
    </div>
  );
}

// Sub-component that fetches per-player info
function PlayerSeatWithInfo({
  gameId,
  playerAddr,
  isYou,
  isCurrentTurn,
  position,
}: {
  gameId: bigint;
  playerAddr: string;
  isYou: boolean;
  isCurrentTurn: boolean;
  position: { top: string; left: string; transform: string };
}) {
  const { data: rawInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "getPlayerInfo",
    args: [gameId, playerAddr as `0x${string}`],
    query: { refetchInterval: 3000 },
  });

  const alive = rawInfo ? (rawInfo as readonly unknown[])[0] as boolean : true;
  const cardCount = rawInfo ? Number((rawInfo as readonly unknown[])[1]) : 0;

  return (
    <PlayerSeat
      address={playerAddr}
      isYou={isYou}
      isCurrentTurn={isCurrentTurn}
      alive={alive}
      cardCount={cardCount}
      position={position}
    />
  );
}
