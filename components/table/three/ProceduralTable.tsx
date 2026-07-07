"use client";

/*
  Procedural "Saloon Noir" poker table, built from primitives so there is
  zero external-asset / licensing / network dependency. Everything is a
  circle in local space, then the whole <group> is scaled to an oval — so a
  real .glb (see TableModel.tsx) can drop into the identical transform later.
*/

export const SALOON_NOIR = {
  espresso: "#0e0a08",
  wood: "#2a1a12",
  leather: "#241811",
  felt: "#1c5b3a",
  brass: "#d4a548",
  crimson: "#b4212a",
  cyan: "#35e0c8",
  cream: "#f1e9d8",
} as const;

export default function ProceduralTable() {
  return (
    // circular in local space; group-scaled to an oval (X wide, Z short).
    // Kept a touch smaller than the seat ring so avatars sit just off the rail.
    <group scale={[2.9, 1, 2.0]} position={[0, 0, 0]}>
      {/* (no wood base / apron / legs — it read as a dark cylinder up front) */}

      {/* Felt surface — rich emerald with a subtle self-glow so it always reads green */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[1.0, 1.0, 0.1, 72]} />
        <meshStandardMaterial
          color="#2a7a54"
          roughness={0.9}
          metalness={0}
          emissive="#124a30"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Padded leather rail around the edge — low profile so it doesn't dome */}
      <mesh position={[0, 0.055, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.0, 0.05, 20, 96]} />
        <meshPhysicalMaterial
          color={SALOON_NOIR.leather}
          roughness={0.45}
          clearcoat={0.5}
          clearcoatRoughness={0.4}
        />
      </mesh>

      {/* Brass trim ring at the felt/rail seam — proud of the felt so it catches light */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.93, 0.016, 16, 140]} />
        <meshStandardMaterial
          color={SALOON_NOIR.brass}
          metalness={0.95}
          roughness={0.22}
          emissive={SALOON_NOIR.brass}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Cipher-cyan "encrypted" seam just inside the brass — glows (the privacy accent) */}
      <mesh position={[0, 0.104, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.895, 0.014, 14, 160]} />
        <meshStandardMaterial
          color={SALOON_NOIR.cyan}
          emissive={SALOON_NOIR.cyan}
          emissiveIntensity={2.8}
          toneMapped={false}
        />
      </mesh>

      {/* Inner betting line (subtle brass) */}
      <mesh position={[0, 0.086, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.58, 0.004, 10, 120]} />
        <meshStandardMaterial
          color={SALOON_NOIR.brass}
          metalness={0.8}
          roughness={0.35}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* (no legs / no center chip-stack — the felt center stays clear for the
          claim medallion + dealing overlay, and there's no dark base up front) */}
    </group>
  );
}
