"use client";

import { useState, useCallback } from "react";
import { useGameState } from "@/hooks/useGameState";
import { useGameEvents } from "@/hooks/useGameEvents";
import { GamePhase } from "@/types/game";
import OvalTable from "./OvalTable";
import PlayerHand from "./PlayerHand";
import ActionBar from "./ActionBar";
import SidePanel from "./SidePanel";
import ResolveBanner from "./ResolveBanner";
import { usePlayerHand } from "@/hooks/usePlayerHand";
import { useResolveGame } from "@/hooks/useResolveGame";

interface GameTableProps {
  gameId: string;
}

export default function GameTable({ gameId }: GameTableProps) {
  // Parse the id WITHOUT early-returning, so every hook below always runs in
  // the same order (React rules-of-hooks). Invalid ids are handled at render.
  let parsedId: bigint | null;
  try {
    parsedId = BigInt(gameId);
  } catch {
    parsedId = null;
  }
  const id = parsedId ?? BigInt(0);

  const { gameInfo, players, lastPlay, myInfo, address, isPlayer, refetchAll } =
    useGameState(id);

  const cardTypes = usePlayerHand(id, address as `0x${string}` | undefined);

  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());

  // Event-driven log — updated instantly via WebSocket contract events
  const eventLog = useGameEvents(id, address, refetchAll);

  // Client-side keeper: the contract freezes at RoundStarting (phase 1) and
  // ChallengeResolving (phase 3) until someone submits a covalidator-signed
  // decryption attestation. This drives that automatically for players so the
  // deal actually turns into a playable round.
  const resolve = useResolveGame(id, gameInfo?.phase ?? -1, isPlayer);

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

  if (parsedId === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-400 text-sm">Invalid table ID: {gameId}</p>
      </div>
    );
  }

  if (!gameInfo) {
    return (
      <div className="flex items-center justify-center h-full">
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
    <div className="flex h-full w-full">
      {/* LEFT COLUMN: table + hand + actions */}
      <div className="flex flex-1 flex-col min-w-0 px-2 pt-2 pb-3 gap-2">
        {/* Round/challenge resolution status (Inco coprocessor) */}
        <div className="shrink-0">
          <ResolveBanner
            status={resolve.state.status}
            message={resolve.state.message}
            error={resolve.state.error}
            onRetry={resolve.retry}
          />
        </div>

        {/* Turn indicator */}
        {isRoundActive && (
          <div className="text-center shrink-0">
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

        {/* Oval table — grows to fill available height */}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <OvalTable
            gameInfo={gameInfo}
            players={players}
            lastPlay={lastPlay}
            gameId={id}
          />
        </div>

        {/* Player hand + action bar */}
        {isPlayer && isRoundActive && (
          <div className="flex flex-col items-center gap-3 shrink-0">
            <PlayerHand
              cardCount={myCardCount}
              cardTypes={cardTypes}
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

        {/* Spectator notice */}
        {!isPlayer && (
          <div className="shrink-0 bg-navy-800/50 blue-border rounded-xl px-6 py-3 text-center">
            <p className="text-smoke text-sm">
              {"👁"} Spectating — You are not in this game
            </p>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-72 shrink-0 border-l border-blue-600/20 flex flex-col h-full">
        <SidePanel
          gameInfo={gameInfo}
          lastPlay={lastPlay}
          players={players}
          eventLog={eventLog}
        />
      </div>
    </div>
  );
}
