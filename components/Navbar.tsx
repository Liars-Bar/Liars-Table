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
    <nav className="sticky top-0 z-50 w-full bg-navy-800/80 backdrop-blur-sm border-b border-blue-600/30">
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
          <Link href="/" className="flex items-center gap-2">
            <ShieldLockIcon size={28} />
            <span className="font-display text-blue-500 text-xl tracking-wide uppercase">
              Liars Table
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
