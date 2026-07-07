"use client";

import { usePathname } from "next/navigation";
import { ShieldLockIcon } from "@/components/icons/ShieldLockIcon";

export function Footer() {
  const pathname = usePathname();
  // The table page is a full-height game view — no footer, no scroll.
  if (/^\/table\/\d+/.test(pathname)) return null;

  return (
    <footer className="relative z-10 w-full bg-navy-900/60 border-t border-brass/15 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <p className="text-smoke text-sm">
          &copy; 2025 Liar&apos;s Table
        </p>
        <p className="text-smoke text-sm flex items-center gap-1.5">
          <ShieldLockIcon size={16} />
          Encrypted &amp; provably fair · Powered by{" "}
          <span className="text-cipher font-medium">Inco</span> FHE
        </p>
      </div>
    </footer>
  );
}
