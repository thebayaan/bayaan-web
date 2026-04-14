export default function SurahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Surah</h1>
    </div>
  );
}
