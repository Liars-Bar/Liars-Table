"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useReadContract,
  useWriteContract,
  useAccount,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits } from "viem";
import {
  CONTRACT_ADDRESS,
  USDC_ADDRESS,
  LIARS_BAR_ABI,
  ERC20_ABI,
} from "@/config/wagmi";

const MAX_PLAYERS = 5;

interface GameInfo {
  gameId: number;
  phase: number;
  playerCount: number;
  stakeAmount: bigint;
}

function OpenTableCard({
  game,
  onJoin,
  isJoining,
}: {
  game: GameInfo;
  onJoin: (gameId: number) => void;
  isJoining: boolean;
}) {
  return (
    <div className="bg-navy-800 blue-border rounded-xl p-5 card-glow flex items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <div>
          <span className="text-smoke text-xs uppercase tracking-wider">
            Table
          </span>
          <p className="font-display text-blue-500 text-xl">
            #{game.gameId}
          </p>
        </div>
        <div>
          <span className="text-smoke text-xs uppercase tracking-wider">
            Players
          </span>
          <p className="text-cream text-lg">
            {game.playerCount}/{MAX_PLAYERS}
          </p>
        </div>
        <div>
          <span className="text-smoke text-xs uppercase tracking-wider">
            Stake
          </span>
          <p className="text-cream text-lg">
            {formatUnits(game.stakeAmount, 6)} USDC
          </p>
        </div>
      </div>
      <button
        onClick={() => onJoin(game.gameId)}
        disabled={isJoining}
        className="bg-blue-500 text-navy-900 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isJoining ? "Joining..." : "Join"}
      </button>
    </div>
  );
}

function GameFetcher({
  gameId,
  onGameInfo,
}: {
  gameId: number;
  onGameInfo: (info: GameInfo | null) => void;
}) {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "getGameInfo",
    args: [BigInt(gameId)],
  });

  useEffect(() => {
    if (data) {
      const [phase, playerCount, , stakeAmount] = data as [
        number,
        number,
        number,
        bigint,
        string,
        bigint,
        number,
        string,
        bigint,
        bigint,
      ];
      if (phase === 0) {
        onGameInfo({ gameId, phase, playerCount, stakeAmount });
      } else {
        onGameInfo(null);
      }
    }
  }, [data, gameId, onGameInfo]);

  return null;
}

export default function JoinTablePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [tableIdInput, setTableIdInput] = useState("");
  const [joiningGameId, setJoiningGameId] = useState<number | null>(null);
  const [step, setStep] = useState<"idle" | "approving" | "joining">("idle");
  const [openGames, setOpenGames] = useState<GameInfo[]>([]);
  const [gameInfoMap, setGameInfoMap] = useState<
    Record<number, GameInfo | null>
  >({});

  const { data: nextGameId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "nextGameId",
  });

  const totalGames = nextGameId ? Number(nextGameId) : 0;
  const gameIds = Array.from({ length: Math.max(0, totalGames - 1) }, (_, i) => i + 1);

  // Check allowance for the joining game
  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  // Get game info for the table ID input (for stake amount)
  const { data: inputGameInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "getGameInfo",
    args: tableIdInput ? [BigInt(tableIdInput)] : undefined,
    query: { enabled: !!tableIdInput && Number(tableIdInput) > 0 },
  });

  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApprovePending,
  } = useWriteContract();

  const { isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const {
    writeContract: writeJoin,
    data: joinTxHash,
    isPending: isJoinPending,
  } = useWriteContract();

  const { isSuccess: isJoinConfirmed } = useWaitForTransactionReceipt({
    hash: joinTxHash,
  });

  // After approve is confirmed, proceed to join
  useEffect(() => {
    if (isApproveConfirmed && step === "approving" && joiningGameId !== null) {
      setStep("joining");
      writeJoin({
        address: CONTRACT_ADDRESS,
        abi: LIARS_BAR_ABI,
        functionName: "joinGame",
        args: [BigInt(joiningGameId)],
      });
    }
  }, [isApproveConfirmed, step, joiningGameId, writeJoin]);

  // After join is confirmed, navigate to lobby
  useEffect(() => {
    if (isJoinConfirmed && step === "joining" && joiningGameId !== null) {
      router.push(`/lobby/${joiningGameId}`);
    }
  }, [isJoinConfirmed, step, joiningGameId, router]);

  // Collect open games from fetcher callbacks
  useEffect(() => {
    const open = Object.values(gameInfoMap).filter(
      (g): g is GameInfo => g !== null
    );
    setOpenGames(open);
  }, [gameInfoMap]);

  const handleJoin = (gameId: number) => {
    if (!isConnected || !address) return;

    setJoiningGameId(gameId);

    // Find stake amount - either from input game info or from open games list
    let stakeAmount: bigint | undefined;
    if (inputGameInfo && tableIdInput && Number(tableIdInput) === gameId) {
      const stake = (inputGameInfo as readonly [number, number, number, bigint, ...unknown[]])[3];
      stakeAmount = stake;
    } else {
      const game = openGames.find((g) => g.gameId === gameId);
      stakeAmount = game?.stakeAmount;
    }

    if (!stakeAmount) {
      // Fallback: just try joining directly
      setStep("joining");
      writeJoin({
        address: CONTRACT_ADDRESS,
        abi: LIARS_BAR_ABI,
        functionName: "joinGame",
        args: [BigInt(gameId)],
      });
      return;
    }

    // Check if approval is needed
    const currentAllowance = allowance ?? BigInt(0);
    if (currentAllowance < stakeAmount) {
      setStep("approving");
      writeApprove({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, stakeAmount],
      });
    } else {
      setStep("joining");
      writeJoin({
        address: CONTRACT_ADDRESS,
        abi: LIARS_BAR_ABI,
        functionName: "joinGame",
        args: [BigInt(gameId)],
      });
    }
  };

  const handleJoinById = () => {
    const id = Number(tableIdInput);
    if (id > 0) {
      handleJoin(id);
    }
  };

  const handleGameInfo = (gameId: number) => (info: GameInfo | null) => {
    setGameInfoMap((prev) => {
      if (prev[gameId] === info) return prev;
      return { ...prev, [gameId]: info };
    });
  };

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    if (step === "approving" || isApprovePending) return "Approving...";
    if (step === "joining" || isJoinPending) return "Joining...";
    return "Join Table";
  };

  return (
    <>
      {/* Hidden game fetchers */}
      {gameIds.map((id) => (
        <GameFetcher key={id} gameId={id} onGameInfo={handleGameInfo(id)} />
      ))}

      <div className="flex flex-col items-center min-h-[calc(100vh-130px)] px-6 py-12">
        {/* Join by Table ID */}
        <div className="w-full max-w-2xl mb-12">
          <h1 className="font-display text-blue-500 text-4xl mb-2 text-center">
            Join a Table
          </h1>
          <p className="text-smoke text-center mb-8">
            Enter a Table ID to join directly, or browse open tables below
          </p>

          <div className="flex gap-3">
            <input
              type="number"
              min="1"
              placeholder="Enter Table ID..."
              value={tableIdInput}
              onChange={(e) => setTableIdInput(e.target.value)}
              className="flex-1 bg-navy-800 blue-border rounded-lg px-4 py-3 text-cream placeholder:text-smoke/50 outline-none focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={handleJoinById}
              disabled={
                !tableIdInput ||
                Number(tableIdInput) <= 0 ||
                !isConnected ||
                step !== "idle"
              }
              className="bg-blue-500 text-navy-900 font-semibold px-8 py-3 rounded-lg hover:bg-blue-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {joiningGameId === Number(tableIdInput)
                ? getButtonText()
                : "Join Table"}
            </button>
          </div>
        </div>

        {/* Open Tables List */}
        <div className="w-full max-w-2xl">
          <h2 className="font-display text-blue-500 text-2xl mb-6">
            Open Tables
          </h2>

          {totalGames <= 1 && (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">🃏</span>
              <p className="text-smoke">
                No tables have been created yet. Be the first to create one!
              </p>
            </div>
          )}

          {totalGames > 1 && openGames.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">⏳</span>
              <p className="text-smoke">
                Loading tables...
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {openGames.map((game) => (
              <OpenTableCard
                key={game.gameId}
                game={game}
                onJoin={handleJoin}
                isJoining={joiningGameId === game.gameId && step !== "idle"}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
