import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 text-center max-w-md mx-auto my-6">
      <div className="inline-flex p-3 rounded-2xl bg-slate-700/50 text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-400 mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-all shadow-md active:scale-95 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
