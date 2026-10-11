import React from 'react';
import { ForecastData, TemperatureUnit, SpeedUnit, TimeFormat } from '../types/weather';
import { formatTemperature, formatSpeed, formatTimeDisplay } from '../services/weatherService';
import { ForecastCharts } from '../components/forecast/ForecastCharts';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  Calendar,
  Clock,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
} from 'lucide-react';

interface ForecastPageProps {
  forecast: ForecastData | null;
  isLoading: boolean;
  tempUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
  timeFormat: TimeFormat;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({
  forecast,
  isLoading,
  tempUnit,
  speedUnit,
  timeFormat,
}) => {
  if (isLoading && !forecast) {
    return <LoadingSkeleton />;
  }

  if (!forecast) {
    return (
      <div className="text-center py-12 text-slate-400">
        No forecast information available for current station.
      </div>
    );
  }

  const getConditionIcon = (main: string) => {
    switch (main?.toLowerCase()) {
      case 'clear':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'clouds':
        return <CloudSun className="w-5 h-5 text-sky-300" />;
      case 'rain':
        return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'drizzle':
        return <CloudDrizzle className="w-5 h-5 text-teal-300" />;
      case 'thunderstorm':
        return <CloudLightning className="w-5 h-5 text-yellow-400" />;
      case 'snow':
        return <Snowflake className="w-5 h-5 text-cyan-200" />;
      default:
        return <Cloud className="w-5 h-5 text-slate-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Detailed Meteorological Forecast &amp; Trends
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Station: <span className="text-slate-200 font-semibold">{forecast.city}, {forecast.country}</span> • Multi-model synoptic predictions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              forecast.is_demo
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {forecast.is_demo ? 'DEMO FORECAST — SAMPLE DATA' : 'LIVE NUMERICAL WEATHER PREDICTION'}
          </span>
        </div>
      </div>

      {/* Interactive Recharts Canvas */}
      <ForecastCharts forecast={forecast} tempUnit={tempUnit} speedUnit={speedUnit} />

      {/* Hourly Forecast Timeline */}
      <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/50">
          <Clock className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Hourly Observation Intervals (24-Hour Horizon)
          </h3>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max">
            {forecast.hourly.map((h, i) => (
              <div
                key={i}
                className="w-28 p-3 rounded-2xl bg-slate-900/60 border border-slate-700/60 flex flex-col items-center justify-between text-center hover:border-sky-500/40 transition-all"
              >
                <span className="text-xs font-mono font-bold text-slate-300">{h.time}</span>
                <div className="my-2 p-1.5 rounded-xl bg-slate-800/60">
                  {getConditionIcon(h.weather_main)}
                </div>
                <span className="text-sm font-bold text-white font-mono">
                  {formatTemperature(h.temp, tempUnit)}
                </span>
                <span className="text-micro text-slate-400">
                  Feels {formatTemperature(h.feels_like, tempUnit)}
                </span>

                <div className="mt-2 pt-2 border-t border-slate-800 w-full space-y-1">
                  <div className="flex items-center justify-between text-micro text-cyan-400">
                    <Droplets className="w-3 h-3" />
                    <span>{h.precipitation_prob}%</span>
                  </div>
                  <div className="flex items-center justify-between text-micro text-sky-400">
                    <Wind className="w-3 h-3" />
                    <span>{formatSpeed(h.wind_speed, speedUnit)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Multi-Day Detailed Cards */}
      <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/50">
          <Calendar className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            7-Day Detailed Outlook
          </h3>
        </div>

        <div className="space-y-3">
          {forecast.daily.map((d, i) => (
            <div
              key={d.date}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                i === 0
                  ? 'bg-sky-500/10 border-sky-500/30'
                  : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-700/50'
              }`}
            >
              {/* Day & Condition */}
              <div className="flex items-center gap-4 min-w-0 sm:min-w-[12.5rem]">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  {getConditionIcon(d.weather_main)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{d.day_name}</span>
                    <span className="text-xs font-mono text-slate-400">{d.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 capitalize">{d.weather_description}</p>
                </div>
              </div>

              {/* Temperatures */}
              <div className="flex items-center gap-4">
                <div className="text-left md:text-right">
                  <span className="text-xs text-slate-400 block font-medium">Temperature Bounds</span>
                  <div className="flex items-baseline gap-2 font-mono text-sm">
                    <span className="font-bold text-white">Max: {formatTemperature(d.temp_max, tempUnit)}</span>
                    <span className="text-slate-400">Min: {formatTemperature(d.temp_min, tempUnit)}</span>
                  </div>
                </div>
              </div>

              {/* Precipitation & Wind */}
              <div className="flex items-center gap-6 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="block font-semibold text-white">{d.precipitation_prob}% rain prob</span>
                    <span className="text-micro text-slate-400">{d.rain_mm} mm expected</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-sky-400" />
                  <div>
                    <span className="block font-semibold text-white">{formatSpeed(d.wind_speed, speedUnit)}</span>
                    <span className="text-micro text-slate-400">{d.humidity}% humidity</span>
                  </div>
                </div>
              </div>

              {/* Sun Times */}
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                <div className="flex items-center gap-1.5" title="Sunrise">
                  <Sunrise className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatTimeDisplay(d.sunrise, timeFormat)}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Sunset">
                  <Sunset className="w-3.5 h-3.5 text-orange-400" />
                  <span>{formatTimeDisplay(d.sunset, timeFormat)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
