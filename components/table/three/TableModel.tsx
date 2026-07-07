"use client";

/*
  OPTIONAL: swap the procedural table for a downloaded .glb model.

  1. Download a low-poly poker table (glTF/GLB) from e.g.
       • Sketchfab   – https://sketchfab.com (search "poker table", filter Downloadable)
       • Poly Pizza  – https://poly.pizza
       • Quaternius  – https://quaternius.com
       • CGTrader    – https://cgtrader.com (filter: Free + glTF)
  2. Save it as  public/models/table.glb
  3. In TableScene.tsx set  USE_GLB = true

  The <group> wrapper keeps the same scale/position as ProceduralTable, so
  the seat-ring alignment stays correct with no other changes.
*/

import { useGLTF } from "@react-three/drei";

const MODEL_URL = "/models/table.glb";

export default function TableModel() {
  const { scene } = useGLTF(MODEL_URL);
  return (
    <group scale={[3, 1, 2.1]} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
