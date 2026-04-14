export default function AdhkarCategoryPage({
  params,
}: {
  params: Promise<{ superId: string }>;
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Adhkar Category</h1>
    </div>
  );
}
