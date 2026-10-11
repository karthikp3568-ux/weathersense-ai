import React from 'react';
import { CloudSun, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-amber-400">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-white text-sm">WeatherSense AI</span>
            <span className="text-tiny text-slate-400 ml-1.5 hidden sm:inline">
              — Intelligent Weather Monitoring &amp; Forecasting
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-tiny">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Backend Telemetry</span>
          </span>
          <span>&bull;</span>
          <span className="text-slate-400">Zero API Key Requirement in Demo Mode</span>
          <span>&bull;</span>
          <span className="text-slate-400 font-mono">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};
