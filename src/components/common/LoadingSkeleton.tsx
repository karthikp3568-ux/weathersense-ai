import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero card skeleton */}
      <div className="h-64 rounded-3xl bg-slate-800/60 border border-slate-700/50 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-700/60 rounded-xl" />
            <div className="h-4 w-32 bg-slate-700/40 rounded-lg" />
          </div>
          <div className="h-16 w-16 bg-slate-700/60 rounded-2xl" />
        </div>
        <div className="flex items-baseline gap-4">
          <div className="h-14 w-36 bg-slate-700/60 rounded-xl" />
          <div className="h-6 w-48 bg-slate-700/40 rounded-lg" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-800/60 border border-slate-700/50 p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-slate-700/50 rounded" />
              <div className="h-4 w-4 bg-slate-700/50 rounded-full" />
            </div>
            <div className="h-7 w-24 bg-slate-700/60 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};
