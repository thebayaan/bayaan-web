export default function QuranSurahPage({
  params,
}: {
  params: Promise<{ surah: string }>;
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Quran — Reading View</h1>
    </div>
  );
}
