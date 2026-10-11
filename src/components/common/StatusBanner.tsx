import React from 'react';
import { DataSource } from '../../types/weather';
import { Wifi, AlertTriangle, ShieldCheck } from 'lucide-react';

interface StatusBannerProps {
  dataSource?: DataSource;
  isDemo?: boolean;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ dataSource, isDemo }) => {
  if (isDemo || dataSource === 'demo_sample') {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2 transition-all">
        <div className="flex items-center gap-2 font-medium">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold tracking-wide uppercase text-amber-300">DEMO MODE — SAMPLE DATA</span>
          <span className="hidden sm:inline text-amber-300/80">
            • Displaying verified baseline telemetry for demonstration and laboratory testing.
          </span>
        </div>
        <div className="flex items-center gap-2 text-tiny text-amber-300/70 font-mono">
          <span>Static Reference Station</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-2 transition-all">
      <div className="flex items-center gap-2 font-medium">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-semibold tracking-wide text-emerald-300 uppercase">
          LIVE DATA ACTIVE
        </span>
        <span className="text-emerald-300/80">
          • Source:{' '}
          {dataSource === 'live_openweather' ? 'OpenWeather API (Authenticated)' : 'Open-Meteo Global Sensor Mesh'}
        </span>
      </div>
      <div className="flex items-center gap-2 text-emerald-300/70 text-tiny">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        <span>Rate-limit protected (5-min poll)</span>
      </div>
    </div>
  );
};
