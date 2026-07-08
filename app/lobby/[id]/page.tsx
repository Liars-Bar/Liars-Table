"use client";

import { use, useEffect } from "react";
import { motion } from "motion/react";
import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useRouter } from "next/navigation";
import { formatUnits, parseEther } from "viem";
import { CONTRACT_ADDRESS, LIARS_BAR_ABI } from "@/config/wagmi";

const MAX_PLAYERS = 5;
const POLL_INTERVAL = 5000;

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function LobbyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const gameId = BigInt(id);
  const router = useRouter();
  const { address } = useAccount();

  // Poll game info
  const { data: gameInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "getGameInfo",
    args: [gameId],
    query: { refetchInterval: POLL_INTERVAL },
  });

  // Poll players
  const { data: players } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "getPlayers",
    args: [gameId],
    query: { refetchInterval: POLL_INTERVAL },
  });

  const phase = gameInfo ? Number((gameInfo as readonly [number, ...unknown[]])[0]) : -1;
  const playerCount = gameInfo ? Number((gameInfo as readonly [number, number, ...unknown[]])[1]) : 0;
  const stakeAmount = gameInfo ? ((gameInfo as readonly [number, number, number, bigint, ...unknown[]])[3]) : BigInt(0);
  const playerList = (players as readonly string[] | undefined) ?? [];
  const creator = playerList.length > 0 ? playerList[0] : null;
  const isCreator = address && creator && address.toLowerCase() === creator.toLowerCase();

  // Start game tx
  const {
    writeContract: writeStart,
    data: startTxHash,
    isPending: isStartPending,
  } = useWriteContract();

  const { isSuccess: isStartConfirmed } = useWaitForTransactionReceipt({
    hash: startTxHash,
  });

  // Leave game tx
  const {
    writeContract: writeLeave,
    data: leaveTxHash,
    isPending: isLeavePending,
  } = useWriteContract();

  const { isSuccess: isLeaveConfirmed } = useWaitForTransactionReceipt({
    hash: leaveTxHash,
  });

  // Cancel game tx
  const {
    writeContract: writeCancel,
    data: cancelTxHash,
    isPending: isCancelPending,
  } = useWriteContract();

  const { isSuccess: isCancelConfirmed } = useWaitForTransactionReceipt({
    hash: cancelTxHash,
  });

  // Navigate home after leave/cancel confirmed
  if (isLeaveConfirmed || isCancelConfirmed) {
    router.push("/");
  }

  // If game started (phase > 0 and not WaitingForPlayers), navigate to table
  const gameStarted = isStartConfirmed || (phase > 0 && phase !== 4);
  const gameCancelled = phase === 4;

  // Navigate to game table when game starts
  useEffect(() => {
    if (gameStarted) {
      router.push(`/table/${id}`);
    }
  }, [gameStarted, router, id]);

  const handleStart = () => {
    // `startGame` is payable with a `refundUnspent` modifier: it forwards the
    // Inco FHE deal fee and refunds the rest, so a generous flat value is safe
    // for any player count. (Dealing was never the blocker — the round only
    // freezes because it must be advanced with resolveRoundStart; see
    // useResolveGame. Cards are dealt & encrypted inside startGame regardless.)
    writeStart({
      address: CONTRACT_ADDRESS,
      abi: LIARS_BAR_ABI,
      functionName: "startGame",
      args: [gameId],
      value: parseEther("0.01"), // covers the deal for up to MAX_PLAYERS; excess refunded
    });
  };

  const handleLeave = () => {
    writeLeave({
      address: CONTRACT_ADDRESS,
      abi: LIARS_BAR_ABI,
      functionName: "leaveGame",
      args: [gameId],
    });
  };

  const handleCancel = () => {
    writeCancel({
      address: CONTRACT_ADDRESS,
      abi: LIARS_BAR_ABI,
      functionName: "cancelGame",
      args: [gameId],
    });
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-130px)] px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-brass-gradient text-4xl mb-2">
            Table #{id}
          </h1>
          <p className="text-smoke text-lg">
            Stake: <span className="text-cream font-semibold">{formatUnits(stakeAmount, 6)} USDC</span>
          </p>
        </div>

        {/* Navigation handled by useEffect below */}

        {/* Cancelled banner */}
        {gameCancelled && !isLeaveConfirmed && !isCancelConfirmed && (
          <div className="glass rounded-2xl p-6 text-center mb-6">
            <span className="text-4xl block mb-3">❌</span>
            <h2 className="font-display text-brass-gradient text-xl mb-2">Game Cancelled</h2>
            <p className="text-smoke text-sm mb-4">This table has been cancelled.</p>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/")}
              className="bg-blue-500 text-navy-900 font-semibold px-6 py-2.5 rounded-lg hover:brightness-110 transition-[filter] cursor-pointer shadow-[0_10px_24px_-10px_rgba(212,165,72,0.8)]"
            >
              Back to Lobby
            </motion.button>
          </div>
        )}

        {/* Player slots */}
        {!gameCancelled && (
          <>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-brass-gradient text-xl">Players</h2>
              <span className="text-smoke text-sm">
                {playerCount}/{MAX_PLAYERS}
              </span>
            </div>

            <div className="flex flex-col gap-3 mb-8">
              {Array.from({ length: MAX_PLAYERS }, (_, i) => {
                const playerAddr = playerList[i];
                const isYou = playerAddr && address && playerAddr.toLowerCase() === address.toLowerCase();
                const isHost = i === 0 && playerAddr;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: playerAddr ? 1 : 0.55, x: 0 }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 28 }}
                    className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all ${
                      playerAddr
                        ? "glass"
                        : "bg-navy-900/40 border border-dashed border-brass/15"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {playerAddr ? "♠" : "·"}
                      </span>
                      <div>
                        {playerAddr ? (
                          <p className="text-cream font-mono text-sm">
                            {truncateAddress(playerAddr)}
                            {isYou && (
                              <span className="ml-2 text-blue-400 text-xs font-sans">(You)</span>
                            )}
                          </p>
                        ) : (
                          <p className="text-smoke/50 text-sm">Waiting for player...</p>
                        )}
                      </div>
                    </div>
                    {isHost && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md font-semibold border border-brass/25">
                        Host
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Action buttons */}
            {!gameStarted && phase === 0 && (
              <div className="flex flex-col gap-3">
                {isCreator ? (
                  <>
                    <motion.button
                      whileHover={playerCount < 2 || isStartPending ? undefined : { y: -2 }}
                      whileTap={playerCount < 2 || isStartPending ? undefined : { scale: 0.98 }}
                      onClick={handleStart}
                      disabled={playerCount < 2 || isStartPending}
                      className="w-full bg-blue-500 text-navy-900 font-semibold py-3 rounded-lg hover:brightness-110 transition-[filter] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_24px_-10px_rgba(212,165,72,0.8)]"
                    >
                      {isStartPending
                        ? "Starting..."
                        : playerCount < 2
                        ? "Need at least 2 players"
                        : "Start Game"}
                    </motion.button>
                    <button
                      onClick={handleCancel}
                      disabled={isCancelPending}
                      className="w-full bg-transparent text-smoke font-semibold py-3 rounded-lg blue-border hover:bg-navy-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCancelPending ? "Cancelling..." : "Cancel Game"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLeave}
                    disabled={isLeavePending}
                    className="w-full bg-transparent text-smoke font-semibold py-3 rounded-lg blue-border hover:bg-navy-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLeavePending ? "Leaving..." : "Leave Table"}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
