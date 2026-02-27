import { Card } from '@/components/ui/Card';

interface GradientStatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  gradient?: string;
}

export function StatusCard({
  label,
  value,
  icon,
  gradient = 'bg-linear-to-br from-blue-500 to-blue-600',
}: GradientStatCardProps) {
  return (
    <Card className={`${gradient} text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-white/50">{icon}</div>
      </div>
    </Card>
  );
}