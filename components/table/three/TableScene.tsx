"use client";

/* eslint-disable react-hooks/immutability -- three.js requires per-frame
   mutation of the camera inside useFrame; this is the standard R3F pattern
   and the react-hooks immutability rule can't model it. */

import { Suspense, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import ProceduralTable, { SALOON_NOIR } from "./ProceduralTable";

// Camera home position — a pulled-back "poker broadcast" 3/4 view looking down
// at the felt. Aimed slightly toward the viewer so the near (bottom) edge lifts
// up into frame instead of being clipped.
const CAMERA_HOME: [number, number, number] = [0, 7.0, 6.0];
const LOOK_AT: [number, number, number] = [0, 0, 0.35];

/*
  To use a downloaded .glb instead of the procedural table:
    1. put the file at public/models/table.glb
    2. `import TableModel from "./TableModel";`
    3. replace `<ProceduralTable />` inside <Suspense> below with `<TableModel />`
  The <Suspense fallback> keeps the procedural table on screen while the
  model loads (and if it fails), so the game never renders an empty felt.
*/

/**
 * Reads the pointer from a window listener (the canvas is pointer-events-none,
 * so it can't receive pointer events itself) and gently lerps the camera for a
 * parallax feel. Disabled under reduced-motion.
 */
function ParallaxRig() {
  const { camera } = useThree();
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    const tx = CAMERA_HOME[0] + target.current.x * 0.3;
    const ty = CAMERA_HOME[1] - target.current.y * 0.15;
    camera.position.x += (tx - camera.position.x) * 0.05;
    camera.position.y += (ty - camera.position.y) * 0.05;
    camera.position.z += (CAMERA_HOME[2] - camera.position.z) * 0.05;
    camera.lookAt(LOOK_AT[0], LOOK_AT[1], LOOK_AT[2]);
  });

  return null;
}

export default function TableScene() {
  return (
    <>
      {/* dim warm room fill — keeps the saloon mood dramatic, not flat */}
      <ambientLight intensity={0.4} color={SALOON_NOIR.cream} />
      <directionalLight position={[0, 7, 2]} intensity={0.32} color="#fff3dd" />

      {/* THE hanging saloon lamp — a bright warm pool straight down on the felt */}
      <spotLight
        position={[0, 5.2, 0.5]}
        angle={0.6}
        penumbra={1}
        intensity={3.4}
        color="#ffe2b0"
        distance={12}
        decay={0}
      />
      {/* secondary key from front for soft shadows + rail highlight */}
      <spotLight
        position={[0, 7.5, 4]}
        angle={0.6}
        penumbra={0.9}
        intensity={1.6}
        color="#ffe9c7"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* cyan "encrypted" rim from back-left */}
      <pointLight position={[-3.4, 1.6, -3]} intensity={0.9} color={SALOON_NOIR.cyan} />
      {/* crimson tension accent, opposite side */}
      <pointLight position={[3.6, 1.0, -2.6]} intensity={0.4} color={SALOON_NOIR.crimson} />
      {/* low warm fill from the front — lifts the near rim/base out of blackness */}
      <pointLight position={[0, 1.4, 6]} intensity={0.7} color="#ffcf9a" />

      {/* network-free environment (no preset → no CDN/CSP dependency) */}
      <Environment resolution={64}>
        <Lightformer intensity={0.7} color={SALOON_NOIR.cream} position={[0, 5, 2]} scale={6} />
        <Lightformer intensity={0.5} color={SALOON_NOIR.cyan} position={[-4, 2, -4]} scale={4} />
        <Lightformer intensity={0.3} color={SALOON_NOIR.brass} position={[4, 2, -3]} scale={3} />
      </Environment>

      <Suspense fallback={<ProceduralTable />}>
        <ProceduralTable />
      </Suspense>

      <ParallaxRig />
    </>
  );
}
