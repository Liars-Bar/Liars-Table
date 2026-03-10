"use client";

import CardFace from "./CardFace";

interface PlayerHandProps {
  cardCount: number;
  selectedSlots: Set<number>;
  onToggleSlot: (slot: number) => void;
  canSelect: boolean;
}

const MAX_HAND_SLOTS = 5;

export default function PlayerHand({
  cardCount,
  selectedSlots,
  onToggleSlot,
  canSelect,
}: PlayerHandProps) {
  return (
    <div className="flex items-end justify-center gap-3">
      {Array.from({ length: MAX_HAND_SLOTS }, (_, i) => {
        const isActive = i < cardCount;
        const isSelected = selectedSlots.has(i);

        return (
          <div
            key={i}
            className="transition-transform duration-200"
            style={{
              transform: `rotate(${(i - 2) * 5}deg) translateY(${Math.abs(i - 2) * 4}px)`,
            }}
          >
            <CardFace
              faceUp={false}
              selected={isSelected}
              disabled={!isActive}
              slot={i}
              onClick={
                isActive && canSelect
                  ? () => onToggleSlot(i)
                  : undefined
              }
            />
          </div>
        );
      })}
    </div>
  );
}
