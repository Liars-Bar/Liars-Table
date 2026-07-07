"use client";

import { motion } from "motion/react";
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

const overlayBase =
  "absolute inset-0 z-30 flex items-center justify-center rounded-[50%]";

export default function GameOverlay({
  phase,
  gameId,
  totalPot,
  currentPlayer,
  aliveCount,
  myAddress,
}: GameOverlayProps) {
  const router = useRouter();

  const { writeContract, data: claimTxHash, isPending } = useWriteContract();

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${overlayBase} bg-navy-900/35`}
      >
        <div className="flex flex-col items-center gap-3">
          <motion.div
            className="text-5xl"
            animate={{ rotate: [0, -8, 8, 0], y: [0, -6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            🎴
          </motion.div>
          <p className="text-blue-400 font-display text-xl">Dealing Cards...</p>
          <p className="text-smoke text-sm">Shuffling the encrypted deck</p>
        </div>
      </motion.div>
    );
  }

  // Challenge Resolving overlay — the revolver spins
  if (phase === GamePhase.ChallengeResolving) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${overlayBase} bg-navy-900/45`}
      >
        <motion.div
          className="absolute w-40 h-40 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(180,33,42,0.4), transparent 70%)" }}
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex flex-col items-center gap-3">
          <motion.div
            className="text-6xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
          >
            🔫
          </motion.div>
          <p className="text-[#e0384a] font-display text-xl">
            Resolving Challenge...
          </p>
          <p className="text-smoke text-sm">The revolver spins</p>
        </div>
      </motion.div>
    );
  }

  // Game Over overlay
  if (phase === GamePhase.GameOver && aliveCount <= 1) {
    const isWinner =
      myAddress && currentPlayer.toLowerCase() === myAddress.toLowerCase();

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${overlayBase} bg-navy-900/85 backdrop-blur-sm`}
      >
        <div className="relative flex flex-col items-center gap-4 pointer-events-auto">
          {/* coin burst */}
          {isWinner &&
            Array.from({ length: 10 }, (_, i) => (
              <motion.span
                key={i}
                className="absolute top-6 text-lg"
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: Math.cos((i / 10) * Math.PI * 2) * 90,
                  y: Math.sin((i / 10) * Math.PI * 2) * 70 - 10,
                  scale: 1,
                }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.05 }}
              >
                🪙
              </motion.span>
            ))}

          <motion.span
            className="text-5xl relative"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 11 }}
          >
            🏆
          </motion.span>
          <motion.p
            className="text-brass-gradient font-display text-2xl font-bold"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Game Over!
          </motion.p>

          {isWinner ? (
            <>
              <p className="text-cream text-lg font-semibold">
                You won {formatUnits(totalPot, 6)} USDC!
              </p>
              {!isClaimed ? (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClaimPrize}
                  disabled={isPending || isClaiming}
                  className="bg-blue-500 text-navy-900 font-semibold px-8 py-3 rounded-xl hover:brightness-110 transition cursor-pointer disabled:opacity-50 shadow-[0_10px_24px_-8px_rgba(212,165,72,0.7)]"
                >
                  {isPending || isClaiming ? "Claiming..." : "Claim Prize"}
                </motion.button>
              ) : (
                <p className="text-[#3fbf7f] font-semibold">Prize Claimed! ✓</p>
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

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/")}
            className="mt-2 bg-transparent text-smoke font-semibold px-6 py-2 rounded-lg blue-border hover:bg-navy-700 transition-colors cursor-pointer text-sm"
          >
            Back to Lobby
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return null;
}
