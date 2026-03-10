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
    <div className="min-h-[calc(100vh-130px)] flex items-start justify-center py-4">
      <GameTable gameId={id} />
    </div>
  );
}
