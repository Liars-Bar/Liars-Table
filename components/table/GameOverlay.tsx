"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACT_ADDRESS, LIARS_BAR_ABI } from "@/config/wagmi";
import { GamePhase } from "@/types/game";
import { useRouter } from "next/navigation";

interface GameOverlayProps {
  phase: GamePhase;
  gameId: bigint;
  totalPot: bigint;
  currentPlayer: string;
  aliveCount: number;
  myAddress?: string;
}

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function GameOverlay({
  phase,
  gameId,
  totalPot,
  currentPlayer,
  aliveCount,
  myAddress,
}: GameOverlayProps) {
  const router = useRouter();

  const {
    writeContract,
    data: claimTxHash,
    isPending,
  } = useWriteContract();

  const { isSuccess: isClaimed, isLoading: isClaiming } =
    useWaitForTransactionReceipt({ hash: claimTxHash });

  const handleClaimPrize = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: LIARS_BAR_ABI,
      functionName: "claimPrize",
      args: [gameId],
    });
  };

  // Round Starting overlay
  if (phase === GamePhase.RoundStarting) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-navy-900/70 backdrop-blur-sm rounded-[50%]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-400 font-display text-xl">Dealing Cards...</p>
          <p className="text-smoke text-sm">Waiting for claim type reveal</p>
        </div>
      </div>
    );
  }

  // Challenge Resolving overlay
  if (phase === GamePhase.ChallengeResolving) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-navy-900/70 backdrop-blur-sm rounded-[50%]">
        <div className="flex flex-col items-center gap-3">
          <div className="text-5xl animate-bounce">{"🔫"}</div>
          <p className="text-red-400 font-display text-xl">
            Resolving Challenge...
          </p>
          <p className="text-smoke text-sm">The revolver spins...</p>
        </div>
      </div>
    );
  }

  // Game Over overlay
  if (phase === GamePhase.GameOver && aliveCount <= 1) {
    const isWinner =
      myAddress && currentPlayer.toLowerCase() === myAddress.toLowerCase();

    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm rounded-[50%]">
        <div className="flex flex-col items-center gap-4 pointer-events-auto">
          <span className="text-5xl">{"🏆"}</span>
          <p className="text-blue-400 font-display text-2xl">Game Over!</p>

          {isWinner ? (
            <>
              <p className="text-cream text-lg font-semibold">
                You won {formatUnits(totalPot, 6)} USDC!
              </p>
              {!isClaimed ? (
                <button
                  onClick={handleClaimPrize}
                  disabled={isPending || isClaiming}
                  className="bg-blue-500 text-navy-900 font-semibold px-8 py-3 rounded-xl hover:bg-blue-400 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPending || isClaiming ? "Claiming..." : "Claim Prize"}
                </button>
              ) : (
                <p className="text-green-400 font-semibold">Prize Claimed!</p>
              )}
            </>
          ) : (
            <>
              <p className="text-cream text-sm">
                Winner: {truncateAddress(currentPlayer)}
              </p>
              <p className="text-smoke text-sm">
                Prize: {formatUnits(totalPot, 6)} USDC
              </p>
            </>
          )}

          <button
            onClick={() => router.push("/")}
            className="mt-2 bg-transparent text-smoke font-semibold px-6 py-2 rounded-lg blue-border hover:bg-navy-700 transition-colors cursor-pointer text-sm"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return null;
}
