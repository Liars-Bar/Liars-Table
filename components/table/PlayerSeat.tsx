"use client";

import { ShieldLockIcon } from "@/components/icons/ShieldLockIcon";

interface PlayerSeatProps {
  address: string;
  isYou: boolean;
  isCurrentTurn: boolean;
  alive: boolean;
  cardCount: number;
  position: { top: string; left: string; transform: string };
}

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function PlayerSeat({
  address,
  isYou,
  isCurrentTurn,
  alive,
  cardCount,
  position,
}: PlayerSeatProps) {
  return (
    <div
      className="absolute z-10 flex flex-col items-center gap-1"
      style={{
        top: position.top,
        left: position.left,
        transform: position.transform,
      }}
    >
      {/* Avatar circle */}
      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center
          bg-navy-800 blue-border transition-all duration-300
          ${isCurrentTurn && alive ? "seat-active animate-pulse ring-2 ring-blue-500" : ""}
          ${!alive ? "opacity-40" : ""}
        `}
      >
        {alive ? (
          <ShieldLockIcon size={24} />
        ) : (
          <span className="text-2xl">{"💀"}</span>
        )}
      </div>

      {/* Name + info */}
      <div className="flex flex-col items-center">
        <span className="text-cream text-xs font-mono">
          {truncateAddress(address)}
        </span>
        {isYou && (
          <span className="text-blue-400 text-[10px] font-semibold">
            (You)
          </span>
        )}
        {alive && (
          <div className="flex items-center gap-0.5 mt-0.5">
            {Array.from({ length: cardCount }, (_, i) => (
              <div
                key={i}
                className="w-3 h-4 rounded-[2px] card-back"
                style={{ transform: `rotate(${(i - Math.floor(cardCount / 2)) * 8}deg)` }}
              />
            ))}
          </div>
        )}
        {!alive && (
          <span className="text-red-400/70 text-[10px]">Eliminated</span>
        )}
      </div>
    </div>
  );
}
