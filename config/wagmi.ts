"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Liars Table",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID_HERE",
  chains: [baseSepolia],
  ssr: true,
});

export const CONTRACT_ADDRESS = "0x781b7dc42b116025653ad885c109cc3881fc8372" as const;
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
