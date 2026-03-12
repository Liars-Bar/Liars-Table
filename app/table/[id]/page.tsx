"use client";

import { use } from "react";
import GameTable from "@/components/table/GameTable";

export default function TablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="h-[calc(100vh-57px)] overflow-hidden">
      <GameTable gameId={id} />
    </div>
  );
}
