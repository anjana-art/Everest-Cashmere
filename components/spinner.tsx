// app/components/spinner.tsx
export function Spinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-amber-600" />
    </div>
  );
}