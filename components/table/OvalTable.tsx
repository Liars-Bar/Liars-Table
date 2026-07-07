"use client";

import { useReadContract, useAccount } from "wagmi";
import { CONTRACT_ADDRESS, LIARS_BAR_ABI } from "@/config/wagmi";
import PlayerSeat from "./PlayerSeat";
import CenterInfo from "./CenterInfo";
import GameOverlay from "./GameOverlay";
import ThrownCards from "./ThrownCards";
import Table3DMount from "./three/Table3DMount";
import { useSupports3D } from "./three/useSupports3D";
import { GamePhase } from "@/types/game";
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
  const supports3D = useSupports3D();

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

  // Seat position of whoever played last → cards fly from there to the center
  const lastPlayFrom = (() => {
    if (!lastPlay) return null;
    const idx = reorderedPlayers.findIndex(
      (p) => p.toLowerCase() === lastPlay.player.toLowerCase()
    );
    const pos = idx === -1 ? undefined : positions[idx];
    return pos ? { top: pos.top, left: pos.left } : null;
  })();

  return (
    <div className="relative h-full w-full">
      {/* Decorative WebGL 3D table (pointer-events-none, behind everything).
          Falls back to the CSS felt below when 3D is unsupported. */}
      {supports3D && <Table3DMount />}

      {/* Table surface — CSS felt is hidden when the 3D felt renders behind it,
          but the div stays as the positioning context for CenterInfo/GameOverlay */}
      <div
        className={`absolute inset-[8%] rounded-[50%] ${
          supports3D ? "" : "felt-table border-8 border-[#241811]"
        }`}
      >
        {/* Center info — only during active play, so it doesn't sit as a dark
            blurred blob behind the dealing / challenge / game-over overlays */}
        {gameInfo.phase === GamePhase.RoundInProgress && (
          <CenterInfo gameInfo={gameInfo} lastPlay={lastPlay} />
        )}

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

      {/* Played cards flying from a seat into the center pile */}
      <ThrownCards lastPlay={lastPlay} fromPos={lastPlayFrom} />

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
