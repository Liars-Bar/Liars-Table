import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";
import { http, webSocket, fallback } from "viem";

const wsUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_WS_RPC || "wss://base-sepolia.g.alchemy.com/v2/PTij7J6F8Yn9O9V6dqPvj";
const httpUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://base-sepolia.g.alchemy.com/v2/PTij7J6F8Yn9O9V6dqPvj";

export const config = getDefaultConfig({
  appName: "Liars Table",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID_HERE",
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: fallback([
      ...(wsUrl ? [webSocket(wsUrl)] : []),
      http(httpUrl),
    ]),
  },
  ssr: true,
});

// Inco v1 LiarsBar redeploy on Base Sepolia (verified). The old
// 0x781b… deployment was bound to Inco's retired 0.7.x coprocessor and can no
// longer decrypt/resolve. Override with NEXT_PUBLIC_CONTRACT_ADDRESS if needed.
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x0f655F0C1dc79cebFaD91135D3a4F31424ED1FA7") as `0x${string}`;
export const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

export const LIARS_BAR_ABI = [
  {
    type: "function",
    name: "nextGameId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getGameInfo",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [
      { name: "phase", type: "uint8" },
      { name: "playerCount", type: "uint8" },
      { name: "aliveCount", type: "uint8" },
      { name: "stakeAmount", type: "uint256" },
      { name: "stakeToken", type: "address" },
      { name: "totalPot", type: "uint256" },
      { name: "currentClaimType", type: "uint8" },
      { name: "currentPlayer", type: "address" },
      { name: "roundNumber", type: "uint256" },
      { name: "turnDeadline", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPlayers",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "joinGame",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "MAX_PLAYERS",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createGame",
    inputs: [{ name: "stakeAmount", type: "uint256" }],
    outputs: [{ name: "gameId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "startGame",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "leaveGame",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelGame",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // ===== Gameplay functions =====
  {
    type: "function",
    name: "playCards",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "handSlotIndices", type: "uint8[]" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "callLiar",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "forceTurnTimeout",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "claimPrize",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // ===== Round/challenge resolution (permissionless, attestation-based) =====
  // The game advances RoundStarting -> RoundInProgress (and resolves challenges)
  // only when one of these is called with a covalidator-signed decryption
  // attestation for the pending handle. Without them the game freezes after the
  // deal. `DecryptionAttestation` == Solidity struct { bytes32 handle; bytes32 value; }.
  {
    type: "function",
    name: "resolveRoundStart",
    inputs: [
      { name: "gameId", type: "uint256" },
      {
        name: "attestation",
        type: "tuple",
        components: [
          { name: "handle", type: "bytes32" },
          { name: "value", type: "bytes32" },
        ],
      },
      { name: "signatures", type: "bytes[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resolveChallenge",
    inputs: [
      { name: "gameId", type: "uint256" },
      {
        name: "bluffAttestation",
        type: "tuple",
        components: [
          { name: "handle", type: "bytes32" },
          { name: "value", type: "bytes32" },
        ],
      },
      { name: "bluffSignatures", type: "bytes[]" },
      {
        name: "bulletAttestation",
        type: "tuple",
        components: [
          { name: "handle", type: "bytes32" },
          { name: "value", type: "bytes32" },
        ],
      },
      { name: "bulletSignatures", type: "bytes[]" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "resolveTimeoutPenalty",
    inputs: [
      { name: "gameId", type: "uint256" },
      {
        name: "bulletAttestation",
        type: "tuple",
        components: [
          { name: "handle", type: "bytes32" },
          { name: "value", type: "bytes32" },
        ],
      },
      { name: "bulletSignatures", type: "bytes[]" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  // ===== Resolution support: FHE fee + pending decryption handles =====
  {
    type: "function",
    name: "getFee",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingClaimTypeHandle",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingAllMatchHandle",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingBulletHandle",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    // Public getter for the Game struct (dynamic `playerAddresses[]` array is
    // omitted by Solidity's auto-generated getter). `challenger` is index 13.
    type: "function",
    name: "games",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "phase", type: "uint8" },
      { name: "creator", type: "address" },
      { name: "stakeAmount", type: "uint256" },
      { name: "stakeToken", type: "address" },
      { name: "aliveCount", type: "uint8" },
      { name: "currentPlayerIndex", type: "uint8" },
      { name: "currentClaimType", type: "uint8" },
      { name: "lastPlayer", type: "address" },
      { name: "lastPlayCount", type: "uint8" },
      { name: "roundNumber", type: "uint256" },
      { name: "totalPot", type: "uint256" },
      { name: "winner", type: "address" },
      { name: "turnDeadline", type: "uint256" },
      { name: "challenger", type: "address" },
      { name: "challenged", type: "address" },
    ],
    stateMutability: "view",
  },
  // ===== Gameplay view functions =====
  {
    type: "function",
    name: "getLastPlay",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [
      { name: "player", type: "address" },
      { name: "cardCount", type: "uint8" },
      { name: "claimedType", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPlayerInfo",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "player", type: "address" },
    ],
    outputs: [
      { name: "alive", type: "bool" },
      { name: "cards", type: "uint8" },
      { name: "isCurrentTurn", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMyHand",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "player", type: "address" },
    ],
    outputs: [
      { name: "cards", type: "uint256[10]" },
      { name: "active", type: "bool[10]" },
    ],
    stateMutability: "view",
  },
  // ===== Events =====
  {
    type: "event",
    name: "RoundStarted",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "roundNumber", type: "uint256", indexed: false },
      { name: "claimType", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "CardsPlayed",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: false },
      { name: "cardCount", type: "uint8", indexed: false },
      { name: "claimedType", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "LiarCalled",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "challenger", type: "address", indexed: false },
      { name: "challenged", type: "address", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ChallengeResult",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "penaltyTarget", type: "address", indexed: false },
      { name: "wasBluff", type: "bool", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RevolverResult",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: false },
      { name: "eliminated", type: "bool", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PlayerEliminated",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TurnAdvanced",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "currentPlayer", type: "address", indexed: false },
    ],
  },
  {
    type: "event",
    name: "GameWon",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: false },
      { name: "prize", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PotClaimed",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PlayerTimedOut",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: false },
    ],
  },
] as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
] as const;
