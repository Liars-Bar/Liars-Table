"use client";

import { Lightning } from "@inco/js/lite";
import { bytesToHex } from "viem";

const INCO_CHAIN_ID = 84532 as const;
const INCO_PEPPER = "testnet" as const;

export const ZERO_HANDLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

/**
 * Build a Lightning (Inco) client bound to a reliable host-chain RPC.
 *
 * The @inco/js SDK otherwise hardcodes the host-chain RPC to the public
 * `https://sepolia.base.org`, which frequently times out reading the verifier
 * config off the executor contract. If a reliable RPC is configured we bind to
 * it via `Lightning.custom(...)`; on any error we fall back to the default
 * `Lightning.latest(...)`, so this can only help.
 *
 * NOTE: kept in sync with the identical helper in `hooks/usePlayerHand.ts`
 * (the proven hand-decrypt path is intentionally left untouched).
 */
export async function makeLightning() {
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
      console.warn("[inco] custom RPC init failed; using default RPC", err);
    }
  }
  return Lightning.latest(INCO_PEPPER, INCO_CHAIN_ID);
}

/** On-chain-submittable decryption attestation for a publicly-revealed handle. */
export interface FormattedAttestation {
  /** Matches the Solidity `DecryptionAttestation { bytes32 handle; bytes32 value; }`. */
  attestation: { handle: `0x${string}`; value: `0x${string}` };
  /** Covalidator signatures, as `bytes[]`. */
  signatures: `0x${string}`[];
}

function toBytes32(value: unknown): `0x${string}` {
  // Revealed values can be euint (number/bigint) or ebool (boolean).
  const n =
    typeof value === "boolean"
      ? value
        ? BigInt(1)
        : BigInt(0)
      : BigInt(value as string | number | bigint);
  return `0x${n.toString(16).padStart(64, "0")}` as `0x${string}`;
}

/**
 * Fetch on-chain-submittable reveal attestations for one or more publicly
 * revealed handles (values that the contract exposed via `e.reveal(...)`).
 * No wallet signature is required for public reveals.
 */
export async function fetchAttestations(
  handles: string[]
): Promise<FormattedAttestation[]> {
  const zap = await makeLightning();
  // `attestedReveal` hits KmsService/AttestedReveal — the no-auth path for
  // handles already made public on-chain with `.reveal()`.
  const results = await zap.attestedReveal(handles as `0x${string}`[]);
  return results.map((r) => ({
    attestation: {
      handle: r.handle as `0x${string}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: toBytes32((r.plaintext as any)?.value),
    },
    signatures: (r.covalidatorSignatures ?? []).map((s) => bytesToHex(s)),
  }));
}

export async function fetchAttestation(
  handle: string
): Promise<FormattedAttestation | null> {
  const [first] = await fetchAttestations([handle]);
  return first ?? null;
}
