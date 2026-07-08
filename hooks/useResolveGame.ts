"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  usePublicClient,
  useWalletClient,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { CONTRACT_ADDRESS, LIARS_BAR_ABI } from "@/config/wagmi";
import { fetchAttestation, fetchAttestations, ZERO_HANDLE } from "@/lib/inco";

type ResolveStatus =
  | "idle"
  | "fetching_attestation"
  | "submitting_tx"
  | "confirming"
  | "done"
  | "error";

interface ResolveState {
  status: ResolveStatus;
  message: string;
  error?: string;
}

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

/**
 * Drives the permissionless round/challenge resolution the contract needs to
 * advance past RoundStarting (phase 1) and ChallengeResolving (phase 3).
 *
 * `_startNewRound` deals the (encrypted) cards and publishes a pending handle
 * for the round's claim card via `e.reveal(...)`; nothing on-chain auto-advances
 * — an off-chain actor must fetch the reveal attestation and submit
 * `resolveRoundStart`. This hook does that, in the player's browser, the moment
 * the pending handle appears. Same pattern for challenge / timeout resolution.
 *
 * Pass `enabled=false` for spectators so they don't pay gas to resolve.
 */
export function useResolveGame(gameId: bigint, phase: number, enabled = true) {
  const [state, setState] = useState<ResolveState>({ status: "idle", message: "" });
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const resolveInProgress = useRef(false);
  const prevPhaseRef = useRef(phase);

  const { data: fheFee } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "getFee",
    query: { enabled },
  });

  // Read pending handles based on phase
  const { data: claimTypeHandle } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "pendingClaimTypeHandle",
    args: [gameId],
    query: { enabled: enabled && phase === 1, refetchInterval: 15000 },
  });

  const { data: allMatchHandle } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "pendingAllMatchHandle",
    args: [gameId],
    query: { enabled: enabled && phase === 3, refetchInterval: 15000 },
  });

  const { data: bulletHandle } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "pendingBulletHandle",
    args: [gameId],
    query: { enabled: enabled && phase === 3, refetchInterval: 15000 },
  });

  // Read raw game data for challenger (to distinguish timeout vs challenge)
  const { data: rawGameData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "games",
    args: [gameId],
    query: { enabled: enabled && phase === 3, refetchInterval: 15000 },
  });

  const { writeContract, data: txHash, error: txError, reset: resetWrite } =
    useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  // Reset when phase changes (e.g. phase 3 -> 1 for a new round)
  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      prevPhaseRef.current = phase;
      setState({ status: "idle", message: "" });
      resolveInProgress.current = false;
      resetWrite();
    }
  }, [phase, resetWrite]);

  useEffect(() => {
    if (isConfirming && state.status === "submitting_tx") {
      setState({ status: "confirming", message: "Confirming transaction..." });
    }
  }, [isConfirming, state.status]);

  useEffect(() => {
    if (isConfirmed && (state.status === "submitting_tx" || state.status === "confirming")) {
      setState({ status: "done", message: "Resolution confirmed!" });
      resolveInProgress.current = false;
    }
  }, [isConfirmed, state.status]);

  useEffect(() => {
    if (txError && (state.status === "submitting_tx" || state.status === "confirming")) {
      setState({
        status: "error",
        message: "Transaction failed",
        error: txError.message?.slice(0, 120),
      });
      resolveInProgress.current = false;
    }
  }, [txError, state.status]);

  const resolveRoundStart = useCallback(async () => {
    if (resolveInProgress.current) return;
    if (!publicClient || !walletClient) return;
    if (!claimTypeHandle || claimTypeHandle === ZERO_HANDLE) return;

    resolveInProgress.current = true;
    setState({ status: "fetching_attestation", message: "Revealing round card via Inco…" });

    try {
      const result = await fetchAttestation(claimTypeHandle as string);
      if (!result) {
        setState({ status: "error", message: "Failed to fetch attestation" });
        resolveInProgress.current = false;
        return;
      }

      setState({ status: "submitting_tx", message: "Starting the round…" });
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: LIARS_BAR_ABI,
        functionName: "resolveRoundStart",
        args: [gameId, result.attestation, result.signatures],
      });
    } catch (e) {
      setState({
        status: "error",
        message: "Round start failed",
        error: (e as Error).message?.slice(0, 120),
      });
      resolveInProgress.current = false;
    }
  }, [publicClient, walletClient, claimTypeHandle, gameId, writeContract]);

  const resolveChallenge = useCallback(async () => {
    if (resolveInProgress.current) return;
    if (!publicClient || !walletClient) return;

    const rawData = rawGameData as readonly unknown[] | undefined;
    const challenger = rawData ? (rawData[13] as string) : ZERO_ADDR;
    const isTimeout = challenger === ZERO_ADDR;

    resolveInProgress.current = true;

    try {
      if (isTimeout) {
        if (!bulletHandle || bulletHandle === ZERO_HANDLE) {
          setState({ status: "error", message: "Bullet handle not ready" });
          resolveInProgress.current = false;
          return;
        }
        setState({ status: "fetching_attestation", message: "Resolving timeout penalty via Inco…" });
        const bulletAtt = await fetchAttestation(bulletHandle as string);
        if (!bulletAtt) {
          setState({ status: "error", message: "Failed to fetch bullet attestation" });
          resolveInProgress.current = false;
          return;
        }
        setState({ status: "submitting_tx", message: "Submitting timeout resolution…" });
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: LIARS_BAR_ABI,
          functionName: "resolveTimeoutPenalty",
          args: [gameId, bulletAtt.attestation, bulletAtt.signatures],
          value: ((fheFee as bigint) ?? BigInt(0)) * BigInt(50),
        });
      } else {
        if (
          !allMatchHandle ||
          allMatchHandle === ZERO_HANDLE ||
          !bulletHandle ||
          bulletHandle === ZERO_HANDLE
        ) {
          setState({ status: "error", message: "Attestation handles not ready" });
          resolveInProgress.current = false;
          return;
        }
        setState({ status: "fetching_attestation", message: "Resolving challenge via Inco…" });
        const results = await fetchAttestations([
          allMatchHandle as string,
          bulletHandle as string,
        ]);
        const bluffAtt = results[0];
        const bulletAtt = results[1];
        if (!bluffAtt || !bulletAtt) {
          setState({ status: "error", message: "Failed to fetch attestations" });
          resolveInProgress.current = false;
          return;
        }
        setState({ status: "submitting_tx", message: "Submitting challenge resolution…" });
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: LIARS_BAR_ABI,
          functionName: "resolveChallenge",
          args: [
            gameId,
            bluffAtt.attestation,
            bluffAtt.signatures,
            bulletAtt.attestation,
            bulletAtt.signatures,
          ],
          value: ((fheFee as bigint) ?? BigInt(0)) * BigInt(50),
        });
      }
    } catch (e) {
      setState({
        status: "error",
        message: "Resolution failed",
        error: (e as Error).message?.slice(0, 120),
      });
      resolveInProgress.current = false;
    }
  }, [
    publicClient,
    walletClient,
    rawGameData,
    bulletHandle,
    allMatchHandle,
    gameId,
    fheFee,
    writeContract,
  ]);

  // Auto-trigger resolution when the pending handle(s) become available
  useEffect(() => {
    if (!enabled) return;
    if (phase === 1 && claimTypeHandle && claimTypeHandle !== ZERO_HANDLE && state.status === "idle") {
      resolveRoundStart();
    }
  }, [enabled, phase, claimTypeHandle, state.status, resolveRoundStart]);

  useEffect(() => {
    if (!enabled) return;
    if (phase === 3 && state.status === "idle") {
      const rawData = rawGameData as readonly unknown[] | undefined;
      const challenger = rawData ? (rawData[13] as string) : ZERO_ADDR;
      const isTimeout = challenger === ZERO_ADDR;

      if (isTimeout && bulletHandle && bulletHandle !== ZERO_HANDLE) {
        resolveChallenge();
      } else if (
        !isTimeout &&
        allMatchHandle &&
        allMatchHandle !== ZERO_HANDLE &&
        bulletHandle &&
        bulletHandle !== ZERO_HANDLE
      ) {
        resolveChallenge();
      }
    }
  }, [enabled, phase, rawGameData, allMatchHandle, bulletHandle, state.status, resolveChallenge]);

  const retry = useCallback(() => {
    setState({ status: "idle", message: "" });
    resolveInProgress.current = false;
  }, []);

  return { state, retry, resolveRoundStart, resolveChallenge };
}
