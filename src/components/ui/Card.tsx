"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className="hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
