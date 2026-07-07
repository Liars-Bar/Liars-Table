"use client";

import { motion } from "motion/react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, LIARS_BAR_ABI } from "@/config/wagmi";
import { CARD_LABELS } from "@/types/game";

interface ActionBarProps {
  gameId: bigint;
  isMyTurn: boolean;
  selectedSlots: Set<number>;
  currentClaimType: number;
  hasLastPlay: boolean;
  onClearSelection: () => void;
}

export default function ActionBar({
  gameId,
  isMyTurn,
  selectedSlots,
  currentClaimType,
  hasLastPlay,
  onClearSelection,
}: ActionBarProps) {
  const {
    writeContract: writePlay,
    data: playTxHash,
    isPending: isPlayPending,
  } = useWriteContract();

  const { isLoading: isPlayConfirming } = useWaitForTransactionReceipt({
    hash: playTxHash,
  });

  const {
    writeContract: writeLiar,
    data: liarTxHash,
    isPending: isLiarPending,
  } = useWriteContract();

  const { isLoading: isLiarConfirming } = useWaitForTransactionReceipt({
    hash: liarTxHash,
  });

  if (!isMyTurn) return null;

  const selectedCount = selectedSlots.size;
  const canPlay = selectedCount >= 1 && selectedCount <= 3;
  const claimLabel = CARD_LABELS[currentClaimType] ?? "?";
  const isProcessing = isPlayPending || isPlayConfirming || isLiarPending || isLiarConfirming;

  const handlePlayCards = () => {
    const slots = Array.from(selectedSlots).sort();
    writePlay({
      address: CONTRACT_ADDRESS,
      abi: LIARS_BAR_ABI,
      functionName: "playCards",
      args: [gameId, slots],
      value: parseEther("0.005"),
    });
    onClearSelection();
  };

  const handleCallLiar = () => {
    writeLiar({
      address: CONTRACT_ADDRESS,
      abi: LIARS_BAR_ABI,
      functionName: "callLiar",
      args: [gameId],
      value: parseEther("0.005"),
    });
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Play Cards */}
      <motion.button
        whileHover={!canPlay || isProcessing ? undefined : { y: -2 }}
        whileTap={!canPlay || isProcessing ? undefined : { scale: 0.97 }}
        onClick={handlePlayCards}
        disabled={!canPlay || isProcessing}
        className="bg-blue-500 text-navy-900 font-semibold px-6 py-3 rounded-xl hover:brightness-110 transition-[filter] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-[0_10px_24px_-10px_rgba(212,165,72,0.8)]"
      >
        {isPlayPending || isPlayConfirming
          ? "Playing..."
          : `Play ${selectedCount} Card${selectedCount !== 1 ? "s" : ""} as ${claimLabel}`}
      </motion.button>

      {/* Call Liar */}
      {hasLastPlay && (
        <motion.button
          whileHover={isProcessing ? undefined : { y: -2 }}
          whileTap={isProcessing ? undefined : { scale: 0.97 }}
          onClick={handleCallLiar}
          disabled={isProcessing}
          className="bg-[#b4212a] text-white font-semibold px-6 py-3 rounded-xl hover:brightness-110 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-[0_10px_24px_-10px_rgba(180,33,42,0.9)]"
        >
          {isLiarPending || isLiarConfirming ? "Calling..." : "Call Liar!"}
        </motion.button>
      )}
    </div>
  );
}
