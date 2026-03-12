export enum GamePhase {
  WaitingForPlayers = 0,
  RoundStarting = 1,
  RoundInProgress = 2,
  ChallengeResolving = 3,
  GameOver = 4,
}

export enum CardType {
  Queen = 0,
  King = 1,
  Ace = 2,
  Joker = 3,
}

export const CARD_LABELS: Record<number, string> = {
  [CardType.Queen]: "Queen",
  [CardType.King]: "King",
  [CardType.Ace]: "Ace",
  [CardType.Joker]: "Joker",
};

export const CARD_SYMBOLS: Record<number, string> = {
  [CardType.Queen]: "Q",
  [CardType.King]: "K",
  [CardType.Ace]: "A",
  [CardType.Joker]: "J",
};

export interface GameInfo {
  phase: GamePhase;
  playerCount: number;
  aliveCount: number;
  stakeAmount: bigint;
  stakeToken: string;
  totalPot: bigint;
  currentClaimType: number;
  currentPlayer: string;
  roundNumber: bigint;
  turnDeadline: bigint;
}

export interface LastPlay {
  player: string;
  cardCount: number;
  claimedType: number;
}

export interface PlayerInfo {
  alive: boolean;
  cardCount: number;
  isCurrentTurn: boolean;
  cardTypes: (CardType | null)[];
}

export interface EventLogEntry {
  id: number;
  timestamp: number;
  message: string;
  type: "info" | "action" | "challenge" | "elimination" | "system";
}
