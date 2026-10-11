import React from 'react';
import { WeatherData, TemperatureUnit, SpeedUnit } from '../../types/weather';
import { formatTemperature } from '../../services/weatherService';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
  CloudFog,
  Star,
  MapPin,
  Clock,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';

interface CurrentWeatherCardProps {
  weather: WeatherData;
  tempUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  tempUnit,
  isFavorite,
  onToggleFavorite,
  onRefresh,
  isRefreshing,
}) => {
  const getWeatherIcon = (main: string) => {
    switch (main?.toLowerCase()) {
      case 'clear':
        return <Sun className="w-16 h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-pulse" />;
      case 'clouds':
        return <CloudSun className="w-16 h-16 text-sky-300 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]" />;
      case 'rain':
        return <CloudRain className="w-16 h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)]" />;
      case 'drizzle':
        return <CloudDrizzle className="w-16 h-16 text-teal-300" />;
      case 'thunderstorm':
        return <CloudLightning className="w-16 h-16 text-yellow-400 animate-bounce" />;
      case 'snow':
        return <Snowflake className="w-16 h-16 text-cyan-200" />;
      case 'fog':
      case 'mist':
      case 'haze':
        return <CloudFog className="w-16 h-16 text-slate-300" />;
      default:
        return <Cloud className="w-16 h-16 text-slate-300" />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950/80 to-slate-900 border border-sky-500/20 shadow-2xl p-6 sm:p-8">
      {/* Subtle ambient light orb */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {weather.city}
              </h1>
              <button
                onClick={onToggleFavorite}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                title={isFavorite ? 'Remove from favorites' : 'Save as favorite'}
              >
                <Star className={`w-5 h-5 ${isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {weather.country} • Lat {weather.lat.toFixed(2)}°, Lon {weather.lon.toFixed(2)}°
            </p>
          </div>
        </div>

        {/* Refresh & Timestamp */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Observed {weather.last_updated}</span>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh weather telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Meteorological Block */}
      <div className="relative z-10 pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Temperature and conditions */}
        <div className="md:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              {getWeatherIcon(weather.weather_main)}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tighter">
                  {formatTemperature(weather.temperature, tempUnit)}
                </span>
              </div>
              <p className="text-sm font-semibold text-sky-300 tracking-wide mt-1">
                {weather.weather_main}
              </p>
            </div>
          </div>

          <div className="h-12 w-px bg-slate-800 hidden sm:block" />

          {/* Bounds & Feels Like */}
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Feels like:</span>
              <span className="font-bold text-white font-mono">
                {formatTemperature(weather.feels_like, tempUnit)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Min: {formatTemperature(weather.temp_min, tempUnit)}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-rose-400 font-mono">
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Max: {formatTemperature(weather.temp_max, tempUnit)}</span>
              </span>
            </div>
            <p className="text-slate-400 capitalize text-xs line-clamp-1 italic">
              &quot;{weather.weather_description}&quot;
            </p>
          </div>
        </div>

        {/* Right Column: Source and Status Badge */}
        <div className="md:col-span-4 flex flex-col sm:items-end justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                weather.is_demo
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  weather.is_demo ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              {weather.is_demo ? 'Demo Dataset' : 'Live Sensor Feed'}
            </span>
          </div>

          <p className="text-tiny text-slate-400 text-left sm:text-right">
            Provider:{' '}
            <span className="text-slate-300 font-medium">
              {weather.data_source === 'live_openweather'
                ? 'OpenWeather API'
                : weather.data_source === 'live_openmeteo'
                ? 'Open-Meteo Global API'
                : 'Verified Offline Laboratory Sample'}
            </span>
          </p>
          <div className="text-micro text-slate-400 font-mono">
            Barometric baseline: {weather.pressure} hPa
          </div>
        </div>
      </div>
    </div>
  );
};
