import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  iconColor?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  iconColor = 'text-sky-400',
  subtitle,
  badge,
  badgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/20',
}) => {
  return (
    <div className="bg-slate-800/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-700/50 hover:border-slate-600/70 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/5 group flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl bg-slate-700/40 border border-slate-700/60 ${iconColor} group-hover:scale-105 transition-transform`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        </div>
        {badge && (
          <span className={`text-micro font-medium px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
          {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
        </div>
        {subtitle && (
          <p className="text-tiny text-slate-400 mt-1 line-clamp-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
