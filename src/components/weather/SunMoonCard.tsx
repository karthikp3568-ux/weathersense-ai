import React from 'react';
import { WeatherData, TimeFormat } from '../../types/weather';
import { formatTimeDisplay } from '../../services/weatherService';
import { Sunrise, Sunset, Clock, Globe } from 'lucide-react';

interface SunMoonCardProps {
  weather: WeatherData;
  timeFormat: TimeFormat;
}

export const SunMoonCard: React.FC<SunMoonCardProps> = ({ weather, timeFormat }) => {
  return (
    <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Sunrise className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Solar Cycle & Daylight
          </span>
        </div>
        <span className="text-tiny font-mono text-slate-400">
          Geographic UTC Offset
        </span>
      </div>

      {/* Sunrise & Sunset Display */}
      <div className="grid grid-cols-2 gap-4 my-2">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-700/30 border border-slate-700/50">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Sunrise className="w-5 h-5" />
          </div>
          <div>
            <span className="text-tiny text-slate-400 block font-medium">Sunrise</span>
            <span className="text-base font-bold text-white font-mono">
              {formatTimeDisplay(weather.sunrise, timeFormat)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-700/30 border border-slate-700/50">
          <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
            <Sunset className="w-5 h-5" />
          </div>
          <div>
            <span className="text-tiny text-slate-400 block font-medium">Sunset</span>
            <span className="text-base font-bold text-white font-mono">
              {formatTimeDisplay(weather.sunset, timeFormat)}
            </span>
          </div>
        </div>
      </div>

      {/* Solar Arc Graphic & Details */}
      <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Station Target</span>
          </span>
          <span className="text-white font-medium">{weather.city}, {weather.country}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Telemetry Mode</span>
          </span>
          <span className={`font-medium ${weather.is_demo ? 'text-amber-400' : 'text-emerald-400'}`}>
            {weather.is_demo ? 'Demonstration Baseline' : 'Live Global Feed'}
          </span>
        </div>
      </div>
    </div>
  );
};
