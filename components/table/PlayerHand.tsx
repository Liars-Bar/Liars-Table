"use client";

import { motion } from "motion/react";
import { CardType } from "@/types/game";
import CardFace from "./CardFace";

interface PlayerHandProps {
  cardCount: number;
  cardTypes: (CardType | null)[];
  selectedSlots: Set<number>;
  onToggleSlot: (slot: number) => void;
  canSelect: boolean;
}

const MAX_HAND_SLOTS = 5;

export default function PlayerHand({
  cardCount,
  cardTypes,
  selectedSlots,
  onToggleSlot,
  canSelect,
}: PlayerHandProps) {
  return (
    <div className="flex items-end justify-center gap-3">
      {Array.from({ length: MAX_HAND_SLOTS }, (_, i) => {
        const isActive = i < cardCount;
        const isSelected = selectedSlots.has(i);
        const cardType = cardTypes[i] ?? null;
        const faceUp = isActive && cardType !== null;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 44, rotate: -10 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{
              delay: i * 0.08,
              type: "spring",
              stiffness: 240,
              damping: 22,
            }}
          >
            {/* inner div carries the static fan transform (kept off the
                motion element so it never fights motion's transform) */}
            <div
              style={{
                transform: `rotate(${(i - 2) * 5}deg) translateY(${Math.abs(i - 2) * 4}px)`,
              }}
            >
              <CardFace
                faceUp={faceUp}
                type={cardType ?? undefined}
                selected={isSelected}
                disabled={!isActive}
                slot={i}
                onClick={
                  isActive && canSelect ? () => onToggleSlot(i) : undefined
                }
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
