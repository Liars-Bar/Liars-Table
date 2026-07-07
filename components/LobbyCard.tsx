"use client";

import Link from "next/link";
import { motion } from "motion/react";

interface LobbyCardProps {
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  href?: string;
  onClick?: () => void;
}

export function LobbyCard({
  title,
  description,
  icon,
  buttonText,
  href,
  onClick,
}: LobbyCardProps) {
  const btn = (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={!href ? onClick : undefined}
      className="mt-auto bg-blue-500 text-navy-900 font-semibold px-6 py-3 rounded-lg cursor-pointer shadow-[0_8px_20px_-8px_rgba(212,165,72,0.7)] hover:brightness-110 transition-[filter]"
    >
      {buttonText}
    </motion.button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative w-full md:w-80 glass rounded-2xl p-8 flex flex-col items-center text-center gap-5 overflow-hidden"
    >
      {/* brass sheen sweep on hover */}
      <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[linear-gradient(115deg,transparent_35%,rgba(240,200,102,0.12)_50%,transparent_65%)]" />
      <span className="text-5xl drop-shadow-[0_2px_10px_rgba(212,165,72,0.35)] transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>
      <h2 className="font-display text-brass-gradient text-2xl">{title}</h2>
      <p className="text-smoke text-sm leading-relaxed">{description}</p>
      {href ? <Link href={href}>{btn}</Link> : btn}
    </motion.div>
  );
}
