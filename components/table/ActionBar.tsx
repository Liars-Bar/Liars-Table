"use client";

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
      <button
        onClick={handlePlayCards}
        disabled={!canPlay || isProcessing}
        className="bg-blue-500 text-navy-900 font-semibold px-6 py-3 rounded-xl hover:bg-blue-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm"
      >
        {isPlayPending || isPlayConfirming
          ? "Playing..."
          : `Play ${selectedCount} Card${selectedCount !== 1 ? "s" : ""} as ${claimLabel}`}
      </button>

      {/* Call Liar */}
      {hasLastPlay && (
        <button
          onClick={handleCallLiar}
          disabled={isProcessing}
          className="bg-red-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {isLiarPending || isLiarConfirming ? "Calling..." : "Call Liar!"}
        </button>
      )}
    </div>
  );
}
