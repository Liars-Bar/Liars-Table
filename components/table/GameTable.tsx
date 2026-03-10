"use client";

import { useState, useCallback } from "react";
import { useGameState } from "@/hooks/useGameState";
import { GamePhase } from "@/types/game";
import OvalTable from "./OvalTable";
import PlayerHand from "./PlayerHand";
import ActionBar from "./ActionBar";
import TurnTimer from "./TurnTimer";

interface GameTableProps {
  gameId: string;
}

export default function GameTable({ gameId }: GameTableProps) {
  const id = BigInt(gameId);
  const { gameInfo, players, lastPlay, myInfo, address, isPlayer } =
    useGameState(id);

  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());

  const handleToggleSlot = useCallback((slot: number) => {
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) {
        next.delete(slot);
      } else if (next.size < 3) {
        next.add(slot);
      }
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedSlots(new Set());
  }, []);

  if (!gameInfo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-smoke text-sm">Loading game...</p>
        </div>
      </div>
    );
  }

  const isRoundActive = gameInfo.phase === GamePhase.RoundInProgress;
  const isMyTurn = myInfo?.isCurrentTurn ?? false;
  const myCardCount = myInfo?.cardCount ?? 0;

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-4 pt-4 pb-6 gap-4">
      {/* Game header */}
      <div className="flex items-center justify-between w-full max-w-4xl">
        <h1 className="font-display text-blue-500 text-2xl">
          Table #{gameId}
        </h1>
        <TurnTimer
          turnDeadline={gameInfo.turnDeadline}
          gameId={id}
          isActive={isRoundActive}
        />
      </div>

      {/* Turn indicator */}
      {isRoundActive && (
        <div className="text-center">
          {isMyTurn ? (
            <p className="text-blue-400 font-semibold text-sm animate-pulse">
              Your Turn — Select cards and play!
            </p>
          ) : (
            <p className="text-smoke text-sm">
              Waiting for{" "}
              <span className="text-cream font-mono text-xs">
                {gameInfo.currentPlayer.slice(0, 6)}...
                {gameInfo.currentPlayer.slice(-4)}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Oval table */}
      <OvalTable
        gameInfo={gameInfo}
        players={players}
        lastPlay={lastPlay}
        gameId={id}
      />

      {/* Player hand + actions (only for players in active game) */}
      {isPlayer && isRoundActive && (
        <div className="flex flex-col items-center gap-4 w-full">
          <PlayerHand
            cardCount={myCardCount}
            selectedSlots={selectedSlots}
            onToggleSlot={handleToggleSlot}
            canSelect={isMyTurn}
          />
          <ActionBar
            gameId={id}
            isMyTurn={isMyTurn}
            selectedSlots={selectedSlots}
            currentClaimType={gameInfo.currentClaimType}
            hasLastPlay={lastPlay !== null}
            onClearSelection={handleClearSelection}
          />
        </div>
      )}

      {/* Spectator mode message */}
      {!isPlayer && (
        <div className="bg-navy-800/50 blue-border rounded-xl px-6 py-3 text-center">
          <p className="text-smoke text-sm">
            {"👁"} Spectating — You are not in this game
          </p>
        </div>
      )}
    </div>
  );
}
