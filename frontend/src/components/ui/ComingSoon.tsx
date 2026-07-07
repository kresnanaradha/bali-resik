export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 text-center">
      <p className="text-lg font-semibold text-gray-700">{title}</p>
      <p className="mt-1 text-sm text-gray-400">Halaman ini sedang dalam pengerjaan.</p>
    </div>
  );
}
