"use client";

import { motion } from "motion/react";
import { CardType, CARD_SYMBOLS } from "@/types/game";
import { ShieldLockIcon } from "@/components/icons/ShieldLockIcon";

interface CardFaceProps {
  faceUp?: boolean;
  type?: CardType;
  selected?: boolean;
  disabled?: boolean;
  slot?: number;
  onClick?: () => void;
}

const SUIT_ICONS: Record<number, string> = {
  [CardType.Queen]: "♥",
  [CardType.King]: "♠",
  [CardType.Ace]: "♦",
  [CardType.Joker]: "♣",
};

const SUIT_COLORS: Record<number, string> = {
  [CardType.Queen]: "text-[#b4212a]",
  [CardType.King]: "text-[#1a1310]",
  [CardType.Ace]: "text-[#b4212a]",
  [CardType.Joker]: "text-[#0f9e8c]",
};

const baseClasses =
  "w-[60px] h-[90px] rounded-lg flex items-center justify-center select-none text-sm font-bold";

export default function CardFace({
  faceUp = false,
  type,
  selected = false,
  disabled = false,
  slot,
  onClick,
}: CardFaceProps) {
  if (disabled) {
    return (
      <div className={`${baseClasses} card-back card-disabled`}>
        <span className="text-cipher/30 text-xs">-</span>
      </div>
    );
  }

  const clickable = onClick !== undefined;
  const selectClass = selected ? "outline outline-2 outline-blue-500 outline-offset-2" : "";

  if (!faceUp) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={clickable ? { y: selected ? -16 : -6 } : undefined}
        whileTap={clickable ? { scale: 0.95 } : undefined}
        animate={{ y: selected ? -14 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        className={`${baseClasses} card-back ${selectClass} ${clickable ? "cursor-pointer" : ""} relative overflow-hidden`}
      >
        {/* encrypted seam glow */}
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(53,224,200,0.18),transparent_60%)]" />
        <div className="relative flex flex-col items-center gap-0.5">
          <ShieldLockIcon size={26} />
          {slot !== undefined && (
            <span className="text-cipher/60 text-[10px] font-mono">
              #{slot + 1}
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  const cardType = type ?? CardType.Queen;
  const symbol = CARD_SYMBOLS[cardType];
  const suit = SUIT_ICONS[cardType];
  const colorClass = SUIT_COLORS[cardType];

  return (
    <motion.div
      onClick={onClick}
      whileHover={clickable ? { y: selected ? -16 : -6 } : undefined}
      whileTap={clickable ? { scale: 0.95 } : undefined}
      animate={{ y: selected ? -14 : 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={`${baseClasses} card-front ${selectClass} ${clickable ? "cursor-pointer" : ""}`}
    >
      <div className="flex flex-col items-center leading-none">
        <span className={`text-2xl font-bold ${colorClass}`}>{symbol}</span>
        <span className={`text-base ${colorClass}`}>{suit}</span>
      </div>
    </motion.div>
  );
}
