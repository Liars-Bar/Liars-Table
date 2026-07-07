"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ShieldLockIcon } from "@/components/icons/ShieldLockIcon";
import { useTableNavInfo } from "@/hooks/useTableNavInfo";
import TableNavInfo from "@/components/table/TableNavInfo";

export function Navbar() {
  const pathname = usePathname();
  const showBack = pathname !== "/";
  const isTablePage = /^\/table\/\d+/.test(pathname);
  const tableNavData = useTableNavInfo();

  return (
    <nav className="sticky top-0 z-50 w-full bg-navy-900/70 backdrop-blur-md border-b border-brass/20 shadow-[0_1px_0_rgba(212,165,72,0.12),0_8px_30px_-12px_rgba(0,0,0,0.8)]">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-3">
        {/* Left: Back + Logo */}
        <div className="flex items-center gap-4">
          {showBack && (
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm text-smoke hover:text-blue-400 transition-colors rounded-full border border-blue-600/20 hover:border-blue-600/40"
            >
              <span>←</span>
              <span>Back</span>
            </Link>
          )}
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-transform duration-200 hover:-translate-y-px"
          >
            <ShieldLockIcon
              size={28}
              className="drop-shadow-[0_0_10px_rgba(53,224,200,0.35)] transition-transform duration-300 group-hover:rotate-3"
            />
            <span className="font-display text-brass-gradient text-xl tracking-[0.16em] uppercase font-bold">
              Liar&apos;s Table
            </span>
          </Link>
        </div>

        {/* Center: Table context info (only on table pages) */}
        {isTablePage && tableNavData.gameId && (
          <TableNavInfo
            gameId={tableNavData.gameId}
            stakeAmount={tableNavData.stakeAmount}
            turnDeadline={tableNavData.turnDeadline}
            isRoundActive={tableNavData.isRoundActive}
          />
        )}

        {/* Right: Nav links + Wallet */}
        <div className="flex items-center gap-3">
          {!showBack && (
            <>
              <Link
                href="/leaderboard"
                className="px-4 py-2 text-sm text-smoke hover:text-blue-400 transition-colors rounded-full border border-blue-600/20 hover:border-blue-600/40"
              >
                Leaderboard
              </Link>
              <Link
                href="/history"
                className="px-4 py-2 text-sm text-smoke hover:text-blue-400 transition-colors rounded-full border border-blue-600/20 hover:border-blue-600/40"
              >
                History
              </Link>
            </>
          )}
          <ConnectButton
            showBalance={false}
            accountStatus={isTablePage ? "avatar" : "full"}
            chainStatus={isTablePage ? "none" : "full"}
          />
        </div>
      </div>
    </nav>
  );
}
