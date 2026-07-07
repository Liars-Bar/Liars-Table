"use client";

import { Canvas } from "@react-three/fiber";
import TableScene from "./TableScene";

/**
 * Pure-decorative WebGL layer. It is `pointer-events-none`, so every click
 * falls through to the interactive HTML (seats, cards, buttons) above it —
 * no game logic ever lives in here.
 */
export default function Table3DCanvas() {
  return (
    <Canvas
      className="!absolute inset-0 !pointer-events-none"
      dpr={[1, 1.75]}
      shadows
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 28, position: [0, 7.0, 6.0] }}
    >
      <TableScene />
    </Canvas>
  );
}
