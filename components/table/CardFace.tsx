"use client";

import { CardType, CARD_SYMBOLS } from "@/types/game";

interface CardFaceProps {
  faceUp?: boolean;
  type?: CardType;
  selected?: boolean;
  disabled?: boolean;
  slot?: number;
  onClick?: () => void;
}

const SUIT_ICONS: Record<number, string> = {
  [CardType.Queen]: "\u2665",
  [CardType.King]: "\u2660",
  [CardType.Ace]: "\u2666",
  [CardType.Joker]: "\u2663",
};

const SUIT_COLORS: Record<number, string> = {
  [CardType.Queen]: "text-red-600",
  [CardType.King]: "text-gray-900",
  [CardType.Ace]: "text-red-600",
  [CardType.Joker]: "text-purple-700",
};

export default function CardFace({
  faceUp = false,
  type,
  selected = false,
  disabled = false,
  slot,
  onClick,
}: CardFaceProps) {
  const baseClasses =
    "w-[60px] h-[90px] rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer select-none text-sm font-bold";

  if (disabled) {
    return (
      <div className={`${baseClasses} card-back card-disabled rounded-lg`}>
        <span className="text-blue-400/30 text-xs">-</span>
      </div>
    );
  }

  if (!faceUp) {
    return (
      <div
        className={`${baseClasses} card-back ${selected ? "card-selected" : ""} hover:brightness-110`}
        onClick={onClick}
      >
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-blue-300 text-lg">{"\u2660"}</span>
          {slot !== undefined && (
            <span className="text-blue-400/60 text-[10px]">#{slot + 1}</span>
          )}
        </div>
      </div>
    );
  }

  const cardType = type ?? CardType.Queen;
  const symbol = CARD_SYMBOLS[cardType];
  const suit = SUIT_ICONS[cardType];
  const colorClass = SUIT_COLORS[cardType];

  return (
    <div
      className={`${baseClasses} card-front ${selected ? "card-selected" : ""}`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <span className={`text-xl font-bold ${colorClass}`}>{symbol}</span>
        <span className={`text-sm ${colorClass}`}>{suit}</span>
      </div>
    </div>
  );
}
