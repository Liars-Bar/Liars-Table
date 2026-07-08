"use client";

import { AnimatePresence, motion } from "motion/react";

interface ResolveBannerProps {
  status: string;
  message: string;
  error?: string;
  onRetry?: () => void;
}

/**
 * Small status strip shown while the client resolves a round start / challenge
 * with Inco (fetching the covalidator attestation + submitting the tx). Keeps
 * the otherwise-silent "waiting for the coprocessor" step visible.
 */
export default function ResolveBanner({ status, message, error, onRetry }: ResolveBannerProps) {
  const visible = status !== "idle" && status !== "done";
  const isError = status === "error";
  const isWorking =
    status === "fetching_attestation" ||
    status === "submitting_tx" ||
    status === "confirming";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border ${
            isError
              ? "border-crimson/40 bg-crimson/10 text-crimson"
              : "border-brass/30 bg-brass/10 text-cipher"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {isWorking && (
              <span className="shrink-0 w-4 h-4 border-2 border-cipher/40 border-t-cipher rounded-full animate-spin" />
            )}
            {isError && <span className="shrink-0 text-base">⚠</span>}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{message}</p>
              {error && <p className="text-xs opacity-70 truncate mt-0.5">{error}</p>}
            </div>
          </div>

          {isError && onRetry && (
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={onRetry}
              className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-crimson/40 bg-crimson/15 hover:bg-crimson/25 text-crimson font-medium transition-colors cursor-pointer"
            >
              Retry
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
