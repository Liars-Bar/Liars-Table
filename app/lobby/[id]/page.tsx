"use client";

import { use, useEffect } from "react";
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
    writeStart({
      address: CONTRACT_ADDRESS,
      abi: LIARS_BAR_ABI,
      functionName: "startGame",
      args: [gameId],
      value: parseEther("0.005"), // covers INCO FHE fees; excess is refunded
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
          <h1 className="font-display text-blue-500 text-4xl mb-2">
            Table #{id}
          </h1>
          <p className="text-smoke text-lg">
            Stake: {formatUnits(stakeAmount, 6)} USDC
          </p>
        </div>

        {/* Navigation handled by useEffect below */}

        {/* Cancelled banner */}
        {gameCancelled && !isLeaveConfirmed && !isCancelConfirmed && (
          <div className="bg-navy-800 blue-border rounded-xl p-6 card-glow text-center mb-6">
            <span className="text-4xl block mb-3">❌</span>
            <h2 className="font-display text-blue-500 text-xl mb-2">Game Cancelled</h2>
            <p className="text-smoke text-sm mb-4">This table has been cancelled.</p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-500 text-navy-900 font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-400 transition-colors cursor-pointer"
            >
              Back to Lobby
            </button>
          </div>
        )}

        {/* Player slots */}
        {!gameCancelled && (
          <>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-blue-500 text-xl">Players</h2>
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
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-xl px-5 py-4 blue-border transition-all ${
                      playerAddr
                        ? "bg-navy-800 card-glow"
                        : "bg-navy-900/50 opacity-50"
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
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md font-semibold">
                        Host
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            {!gameStarted && phase === 0 && (
              <div className="flex flex-col gap-3">
                {isCreator ? (
                  <>
                    <button
                      onClick={handleStart}
                      disabled={playerCount < 2 || isStartPending}
                      className="w-full bg-blue-500 text-navy-900 font-semibold py-3 rounded-lg hover:bg-blue-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isStartPending
                        ? "Starting..."
                        : playerCount < 2
                        ? "Need at least 2 players"
                        : "Start Game"}
                    </button>
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
