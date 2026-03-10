"use client";

import { useState } from "react";
import { LobbyCard } from "@/components/LobbyCard";
import { CreateTableModal } from "@/components/CreateTableModal";

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-blue-500 text-5xl md:text-6xl mb-4">
          Bluff. Call. Survive.
        </h1>
        <p className="text-smoke text-lg max-w-md mx-auto">
          A fully on-chain card game powered by encrypted computation
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <LobbyCard
          icon="♠"
          title="Create a Table"
          description="Start a new game and set the stakes"
          buttonText="Create Table"
          onClick={() => setShowCreateModal(true)}
        />
        <LobbyCard
          icon="♦"
          title="Join a Table"
          description="Enter an open table and test your nerve"
          buttonText="Join Table"
          href="/join-table"
        />
      </div>

      {showCreateModal && (
        <CreateTableModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
