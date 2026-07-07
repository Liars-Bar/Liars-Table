"use client";

import dynamic from "next/dynamic";

/*
  Module-scope dynamic import → stable component identity + code-split out of
  the main bundle. ssr:false is legal here because the whole table tree is a
  client component, and it guarantees three.js never enters a Server Component.
*/
const Table3DCanvas = dynamic(() => import("./Table3DCanvas"), { ssr: false });

export default Table3DCanvas;
