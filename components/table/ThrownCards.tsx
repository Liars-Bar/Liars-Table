"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { LastPlay } from "@/types/game";

/**
 * Animates played cards flying from the acting player's seat into a growing
 * center pile. Purely presentational — driven by `lastPlay` from game state.
 */
export default function ThrownCards({
  lastPlay,
  fromPos,
}: {
  lastPlay: LastPlay | null;
  fromPos: { top: string; left: string } | null;
}) {
  const [flying, setFlying] = useState<
    { id: number; from: { top: string; left: string }; count: number }[]
  >([]);
  const [pile, setPile] = useState(0);
  const idRef = useRef(0);
  const fromRef = useRef(fromPos);
  fromRef.current = fromPos;

  // Unique per play; changes exactly once per turn (player can't play twice in a row)
  const throwKey = lastPlay
    ? `${lastPlay.player}:${lastPlay.cardCount}:${lastPlay.claimedType}`
    : "";

  useEffect(() => {
    if (!throwKey) {
      setPile(0);
      setFlying([]);
      return;
    }
    const from = fromRef.current;
    if (!from) return;
    const count = Number(throwKey.split(":")[1]) || 1;
    const id = idRef.current++;
    setFlying((f) => [...f, { id, from, count }]);
    const t = setTimeout(() => {
      setPile((p) => Math.min(p + count, 30));
      setFlying((f) => f.filter((x) => x.id !== id));
    }, 620);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [throwKey]);

  // deterministic scatter so the pile looks messy but stable across renders
  const rot = (i: number) => ((i * 47) % 60) - 30;
  const dx = (i: number) => ((i * 29) % 14) - 7;
  const dy = (i: number) => ((i * 17) % 12) - 6;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {/* Center pile of already-played cards */}
      {Array.from({ length: Math.min(pile, 14) }, (_, i) => (
        <div
          key={`pile-${i}`}
          className="absolute w-9 h-12 rounded-md card-back"
          style={{
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translate(${dx(i)}px, ${dy(i)}px) rotate(${rot(i)}deg)`,
          }}
        />
      ))}

      {/* Cards currently flying in from a seat */}
      {flying.map((thr) =>
        Array.from({ length: Math.min(thr.count, 3) }, (_, i) => (
          <motion.div
            key={`fly-${thr.id}-${i}`}
            className="absolute w-9 h-12 rounded-md card-back shadow-[0_10px_24px_rgba(0,0,0,0.5)]"
            initial={{
              top: thr.from.top,
              left: thr.from.left,
              x: "-50%",
              y: "-50%",
              rotate: -30,
              scale: 0.5,
              opacity: 0,
            }}
            animate={{
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              rotate: rot(pile + i),
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.55,
              delay: i * 0.09,
              ease: [0.32, 0.72, 0.35, 1],
            }}
          />
        ))
      )}
    </div>
  );
}
