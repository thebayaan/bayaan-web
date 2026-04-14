export default function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Playlist</h1>
    </div>
  );
}
