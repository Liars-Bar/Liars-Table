"use client";

import { useState, useEffect, useRef } from "react";
import { useReadContract, useWalletClient } from "wagmi";
import { CONTRACT_ADDRESS, LIARS_BAR_ABI } from "@/config/wagmi";
import { CardType } from "@/types/game";
import { Lightning } from "@inco/js/lite";
import type { WalletClient } from "viem";

const INCO_CHAIN_ID = 84532 as const;
const INCO_PEPPER = "testnet" as const;

/**
 * The @inco/js SDK hardcodes its host-chain RPC to the public
 * `https://sepolia.base.org`, which frequently times out when it reads the
 * verifier config (`incoVerifier()`) off the executor contract. If a reliable
 * RPC is configured, bind Inco to it via `Lightning.custom(...)`. Falls back to
 * the default `Lightning.latest(...)` on any error, so this can only help.
 */
async function makeLightning() {
  const rpc = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC;
  if (rpc && rpc.startsWith("http")) {
    try {
      const dep = Lightning.latestDeployment(INCO_PEPPER, INCO_CHAIN_ID);
      return await Lightning.custom({
        executorAddress: dep.executorAddress,
        chainId: dep.chainId,
        covalidatorUrls: [
          `https://${dep.executorAddress.toLowerCase()}.${dep.chainId}.${dep.pepper}.inco.org`,
        ],
        hostChainRpcUrl: rpc,
      });
    } catch (err) {
      console.warn(
        "[usePlayerHand] custom Inco RPC init failed; using default RPC",
        err
      );
    }
  }
  return Lightning.latest(INCO_PEPPER, INCO_CHAIN_ID);
}

export function usePlayerHand(
  gameId: bigint,
  address: `0x${string}` | undefined
) {
  const [cardTypes, setCardTypes] = useState<(CardType | null)[]>([]);
  const { data: walletClient } = useWalletClient();
  const decryptingRef = useRef(false);
  const lastHandKeyRef = useRef<string>("");

  const { data: rawHand } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LIARS_BAR_ABI,
    functionName: "getMyHand",
    args: address ? [gameId, address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  useEffect(() => {
    if (!rawHand || !walletClient || !address) return;

    const rawHandTuple = rawHand as unknown as [readonly bigint[], readonly boolean[]];
    const [handles, active] = rawHandTuple;

    // Build a key to detect actual hand changes (avoid re-decrypting same hand)
    const handKey = handles
      .map((h, i) => `${active[i]}:${h.toString()}`)
      .join(",");

    if (handKey === lastHandKeyRef.current || decryptingRef.current) return;
    lastHandKeyRef.current = handKey;
    decryptingRef.current = true;

    const decrypt = async () => {
      try {
        const zap = await makeLightning();

        // Collect only active handles for batch decryption
        const activeIndices: number[] = [];
        const activeHandles: `0x${string}`[] = [];

        for (let i = 0; i < 10; i++) {
          if (active[i] && handles[i] !== BigInt(0)) {
            activeIndices.push(i);
            // Convert bigint handle to 0x-prefixed 32-byte hex string
            activeHandles.push(
              `0x${handles[i].toString(16).padStart(64, "0")}` as `0x${string}`
            );
          }
        }

        if (activeHandles.length === 0) {
          setCardTypes([]);
          return;
        }

        if (!walletClient.account) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const attestations = await zap.attestedDecrypt(
          walletClient as any,
          activeHandles
        );

        const results: (CardType | null)[] = Array(10).fill(null);
        for (let j = 0; j < activeIndices.length; j++) {
          const val = attestations[j]?.plaintext?.value;
          if (val !== undefined && val !== null) {
            results[activeIndices[j]] = Number(val) as CardType;
          }
        }
        setCardTypes(results);
      } catch (err) {
        console.error("[usePlayerHand] decryption failed:", err);
      } finally {
        decryptingRef.current = false;
      }
    };

    decrypt();
  }, [rawHand, walletClient, address]);

  return cardTypes;
}
