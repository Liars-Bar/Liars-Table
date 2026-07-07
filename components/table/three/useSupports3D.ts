"use client";

import { useEffect, useState } from "react";

/**
 * Returns false on the server and on the first client paint (so SSR and the
 * first render agree — no hydration mismatch), then flips to true after mount
 * only when WebGL is available and the user hasn't asked to reduce motion.
 * When false, OvalTable keeps the plain CSS felt and the game is fully playable.
 */
export function useSupports3D(): boolean {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let webgl = false;
    try {
      const canvas = document.createElement("canvas");
      webgl = !!(
        canvas.getContext("webgl2") || canvas.getContext("webgl")
      );
    } catch {
      webgl = false;
    }
    // Intentional one-shot client capability gate (SSR/first-paint = false,
    // then upgrade to 3D once). Runs once on mount; no cascading renders.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOk(webgl && !reduce);
  }, []);

  return ok;
}
