import { useScrollProgress } from '@/lib/hooks';

export function ScrollProgress() {
  const p = useScrollProgress();
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-brand-600 to-forest-600 transition-[width] duration-150"
        style={{ width: `${p * 100}%` }}
      />
    </div>
  );
}
