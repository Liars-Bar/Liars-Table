"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useWatchContractEvent } from "wagmi";
import { formatEther } from "viem";
import { CONTRACT_ADDRESS, LIARS_BAR_ABI } from "@/config/wagmi";
import { CARD_LABELS } from "@/types/game";
import type { EventLogEntry } from "@/types/game";

function short(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function useGameEvents(
  gameId: bigint,
  address: string | undefined,
  refetchAll: () => void
): EventLogEntry[] {
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const idRef = useRef(0);
  const mountedRef = useRef(false);

  const addEvent = useCallback(
    (message: string, type: EventLogEntry["type"] = "info") => {
      setEventLog((prev) => [
        ...prev,
        { id: idRef.current++, timestamp: Date.now(), message, type },
      ]);
    },
    []
  );

  // One-time mount event
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      addEvent("Connected — watching for events via WebSocket", "system");
    }
  }, [addEvent]);

  // ── RoundStarted ──────────────────────────────────────────────────────────
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    eventName: "RoundStarted",
    args: { gameId },
    onLogs(logs) {
      for (const log of logs) {
        const { roundNumber, claimType } = log.args as {
          roundNumber: bigint;
          claimType: number;
        };
        addEvent(
          `Round ${roundNumber.toString()} started — claim: ${CARD_LABELS[claimType] ?? "?"}`,
          "system"
        );
        refetchAll();
      }
    },
  });

  // ── CardsPlayed ───────────────────────────────────────────────────────────
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    eventName: "CardsPlayed",
    args: { gameId },
    onLogs(logs) {
      for (const log of logs) {
        const { player, cardCount, claimedType } = log.args as {
          player: string;
          cardCount: number;
          claimedType: number;
        };
        addEvent(
          `${short(player)} played ${cardCount} card${cardCount !== 1 ? "s" : ""} as ${CARD_LABELS[claimedType] ?? "?"}`,
          "action"
        );
        refetchAll();
      }
    },
  });

  // ── LiarCalled ────────────────────────────────────────────────────────────
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    eventName: "LiarCalled",
    args: { gameId },
    onLogs(logs) {
      for (const log of logs) {
        const { challenger, challenged } = log.args as {
          challenger: string;
          challenged: string;
        };
        addEvent(
          `${short(challenger)} called liar on ${short(challenged)}!`,
          "challenge"
        );
        refetchAll();
      }
    },
  });

  // ── ChallengeResult ───────────────────────────────────────────────────────
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    eventName: "ChallengeResult",
    args: { gameId },
    onLogs(logs) {
      for (const log of logs) {
        const { penaltyTarget, wasBluff } = log.args as {
          penaltyTarget: string;
          wasBluff: boolean;
        };
        addEvent(
          `Challenge: ${short(penaltyTarget)} ${wasBluff ? "was bluffing" : "was NOT bluffing"} — penalty applied`,
          "challenge"
        );
        refetchAll();
      }
    },
  });

  // ── RevolverResult ────────────────────────────────────────────────────────
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    eventName: "RevolverResult",
    args: { gameId },
    onLogs(logs) {
      for (const log of logs) {
        const { player, eliminated } = log.args as {
          player: string;
          eliminated: boolean;
        };
        const isMe = address?.toLowerCase() === player.toLowerCase();
        addEvent(
          `${isMe ? "You" : short(player)} pulled the trigger — ${eliminated ? "ELIMINATED" : "survived"}`,
          "elimination"
        );
        refetchAll();
      }
    },
  });

  // ── PlayerEliminated ──────────────────────────────────────────────────────
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    eventName: "PlayerEliminated",
    args: { gameId },
    onLogs(logs) {
      for (const log of logs) {
        const { player } = log.args as { player: string };
        const isMe = address?.toLowerCase() === player.toLowerCase();
        addEvent(
          `${isMe ? "You were" : `${short(player)} was`} eliminated!`,
          "elimination"
        );
        refetchAll();
      }
    },
  });

  // ── TurnAdvanced ──────────────────────────────────────────────────────────
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    eventName: "TurnAdvanced",
    args: { gameId },
    onLogs(logs) {
      for (const log of logs) {
        const { currentPlayer } = log.args as { currentPlayer: string };
        const isMe = address?.toLowerCase() === currentPlayer.toLowerCase();
        addEvent(
          isMe ? "Your turn!" : `Turn: ${short(currentPlayer)}`,
          isMe ? "system" : "info"
        );
        refetchAll();
      }
    },
  });

  // ── GameWon ───────────────────────────────────────────────────────────────
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    eventName: "GameWon",
    args: { gameId },
    onLogs(logs) {
      for (const log of logs) {
        const { winner, prize } = log.args as { winner: string; prize: bigint };
        const isMe = address?.toLowerCase() === winner.toLowerCase();
        addEvent(
          `${isMe ? "You won" : `${short(winner)} won`} the game! Prize: ${formatEther(prize)} ETH`,
          "system"
        );
        refetchAll();
      }
    },
  });

  // ── PotClaimed ────────────────────────────────────────────────────────────
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    eventName: "PotClaimed",
    args: { gameId },
    onLogs(logs) {
      for (const log of logs) {
        const { winner, amount } = log.args as { winner: string; amount: bigint };
        const isMe = address?.toLowerCase() === winner.toLowerCase();
        addEvent(
          `${isMe ? "You" : short(winner)} claimed the pot (${formatEther(amount)} ETH)`,
          "system"
        );
        refetchAll();
      }
    },
  });

  // ── PlayerTimedOut ────────────────────────────────────────────────────────
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    eventName: "PlayerTimedOut",
    args: { gameId },
    onLogs(logs) {
      for (const log of logs) {
        const { player } = log.args as { player: string };
        const isMe = address?.toLowerCase() === player.toLowerCase();
        addEvent(
          `${isMe ? "You" : short(player)} timed out`,
          "info"
        );
        refetchAll();
      }
    },
  });

  return eventLog;
}
