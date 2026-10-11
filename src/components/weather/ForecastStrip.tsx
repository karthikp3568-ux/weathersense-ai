import React from 'react';
import { DailyForecast, TemperatureUnit } from '../../types/weather';
import { formatTemperature } from '../../services/weatherService';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
  Droplets,
  Calendar,
  ChevronRight,
} from 'lucide-react';

interface ForecastStripProps {
  daily: DailyForecast[];
  tempUnit: TemperatureUnit;
  onViewForecastDetails: () => void;
}

export const ForecastStrip: React.FC<ForecastStripProps> = ({
  daily,
  tempUnit,
  onViewForecastDetails,
}) => {
  const getIcon = (main: string) => {
    switch (main?.toLowerCase()) {
      case 'clear':
        return <Sun className="w-7 h-7 text-amber-400" />;
      case 'clouds':
        return <CloudSun className="w-7 h-7 text-sky-300" />;
      case 'rain':
        return <CloudRain className="w-7 h-7 text-blue-400" />;
      case 'drizzle':
        return <CloudDrizzle className="w-7 h-7 text-teal-300" />;
      case 'thunderstorm':
        return <CloudLightning className="w-7 h-7 text-yellow-400" />;
      case 'snow':
        return <Snowflake className="w-7 h-7 text-cyan-200" />;
      default:
        return <Cloud className="w-7 h-7 text-slate-300" />;
    }
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">7-Day Meteorological Outlook</h3>
            <p className="text-tiny text-slate-400">Synoptic forecast projection</p>
          </div>
        </div>

        <button
          onClick={onViewForecastDetails}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer group"
        >
          <span>Detailed Charts</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {daily.map((day, idx) => (
          <div
            key={day.date}
            className={`p-3 rounded-2xl flex flex-col items-center justify-between text-center border transition-all ${
              idx === 0
                ? 'bg-sky-500/15 border-sky-500/30 shadow-md shadow-sky-500/5'
                : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/40'
            }`}
          >
            <span className={`text-xs font-bold ${idx === 0 ? 'text-sky-400' : 'text-slate-300'}`}>
              {day.day_name}
            </span>
            <span className="text-micro text-slate-400 mb-2 font-mono">
              {day.date.substring(5)}
            </span>

            <div className="my-1">{getIcon(day.weather_main)}</div>

            <div className="mt-2 space-y-1 w-full">
              <div className="flex items-baseline justify-center gap-1.5 text-xs font-mono">
                <span className="font-bold text-white">
                  {formatTemperature(day.temp_max, tempUnit)}
                </span>
                <span className="text-tiny text-slate-400">
                  {formatTemperature(day.temp_min, tempUnit)}
                </span>
              </div>

              {day.precipitation_prob > 0 && (
                <div className="flex items-center justify-center gap-1 text-micro text-cyan-400 font-medium">
                  <Droplets className="w-3 h-3" />
                  <span>{day.precipitation_prob}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
