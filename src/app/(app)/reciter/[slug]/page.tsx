export default function ReciterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Reciter Profile</h1>
    </div>
  );
}
