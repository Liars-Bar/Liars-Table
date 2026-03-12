"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
} from "wagmi";
import { parseUnits } from "viem";
import {
  CONTRACT_ADDRESS,
  USDC_ADDRESS,
  LIARS_BAR_ABI,
  ERC20_ABI,
} from "@/config/wagmi";

const PRESET_AMOUNTS = [1, 5, 10, 50];

export function CreateTableModal({ onClose }: { onClose: () => void }) {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [stakeInput, setStakeInput] = useState("1");
  const [step, setStep] = useState<"select" | "approving" | "creating">("select");

  const stakeAmount = parseUnits(stakeInput || "0", 6);

  // Check current allowance
  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  // Approve tx
  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApprovePending,
  } = useWriteContract();

  const { isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  // Create game tx
  const {
    writeContract: writeCreate,
    data: createTxHash,
    isPending: isCreatePending,
  } = useWriteContract();

  const { isSuccess: isCreateConfirmed } =
    useWaitForTransactionReceipt({
      hash: createTxHash,
    });

  // Read nextGameId to determine the just-created game ID
  const { data: nextGameId, refetch: refetchNextGameId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "nextGameId",
    query: { enabled: false },
  });

  // Guard refs to prevent effects from firing more than once
  const didCreateRef = useRef(false);
  const didNavigateRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // After approve confirmed → create game
  useEffect(() => {
    if (isApproveConfirmed && step === "approving" && !didCreateRef.current) {
      didCreateRef.current = true;
      setStep("creating");
      writeCreate({
        address: CONTRACT_ADDRESS,
        abi: LIARS_BAR_ABI,
        functionName: "createGame",
        args: [stakeAmount],
      });
    }
  }, [isApproveConfirmed, step, stakeAmount, writeCreate]);

  // After create confirmed → fetch nextGameId
  useEffect(() => {
    if (isCreateConfirmed && step === "creating") {
      refetchNextGameId();
    }
  }, [isCreateConfirmed, step, refetchNextGameId]);

  // Once nextGameId is available → navigate to lobby
  useEffect(() => {
    if (isCreateConfirmed && step === "creating" && nextGameId !== undefined && !didNavigateRef.current) {
      didNavigateRef.current = true;
      const gameId = (nextGameId as bigint) - BigInt(1);
      onCloseRef.current();
      router.push(`/lobby/${String(gameId)}`);
    }
  }, [nextGameId, isCreateConfirmed, step, router]);

  const handleProceed = () => {
    if (!isConnected || !address) return;

    const numStake = Number(stakeInput);
    if (numStake < 1) return;

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
      setStep("creating");
      writeCreate({
        address: CONTRACT_ADDRESS,
        abi: LIARS_BAR_ABI,
        functionName: "createGame",
        args: [stakeAmount],
      });
    }
  };

  const isProcessing = step === "approving" || step === "creating";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm"
        onClick={!isProcessing ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-navy-800 blue-border rounded-xl p-8 card-glow w-full max-w-md">
        {/* Close button */}
        {!isProcessing && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-smoke hover:text-cream transition-colors text-xl cursor-pointer"
          >
            ✕
          </button>
        )}

        <h2 className="font-display text-blue-500 text-2xl mb-2 text-center">
              Create a Table
            </h2>
            <p className="text-smoke text-sm text-center mb-6">
              Set your stake amount to create a new game
            </p>

            {/* Preset amounts */}
            <div className="flex gap-2 mb-4">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setStakeInput(String(amount))}
                  disabled={isProcessing}
                  className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                    stakeInput === String(amount)
                      ? "bg-blue-500 text-navy-900"
                      : "bg-navy-900 text-cream blue-border hover:bg-navy-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {amount} USDC
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="mb-6">
              <label className="text-smoke text-xs uppercase tracking-wider mb-1 block">
                Custom Amount (USDC)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={stakeInput}
                onChange={(e) => setStakeInput(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-navy-900 blue-border rounded-lg px-4 py-3 text-cream placeholder:text-smoke/50 outline-none focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
              />
            </div>

            {/* Action button */}
            <button
              onClick={handleProceed}
              disabled={
                !isConnected ||
                isProcessing ||
                isApprovePending ||
                isCreatePending ||
                !stakeInput ||
                Number(stakeInput) < 1
              }
              className="w-full bg-blue-500 text-navy-900 font-semibold py-3 rounded-lg hover:bg-blue-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isConnected
                ? "Connect Wallet"
                : step === "approving" || isApprovePending
                ? "Approving USDC..."
                : step === "creating" || isCreatePending
                ? "Creating Table..."
                : `Create Table — ${stakeInput || 0} USDC`}
            </button>
      </div>
    </div>
  );
}
