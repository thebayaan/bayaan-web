"use client";

import { use } from "react";

export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Playlist</h1>
      <p className="text-muted-foreground">
        Playlist {id} — tracks will load once authentication is connected.
      </p>
    </div>
  );
}
