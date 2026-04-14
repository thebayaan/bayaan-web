export default function QuranAyahPage({
  params,
}: {
  params: Promise<{ surah: string; ayah: string }>;
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Quran — Verse</h1>
    </div>
  );
}
