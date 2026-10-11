import React from 'react';
import { WeatherData, SpeedUnit } from '../../types/weather';
import { formatSpeed } from '../../services/weatherService';
import { MetricCard } from '../common/MetricCard';
import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  Cloud,
  CloudRain,
  Sun,
  Compass,
} from 'lucide-react';

interface WeatherStatsGridProps {
  weather: WeatherData;
  speedUnit: SpeedUnit;
}

function getCompassDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round((deg % 360) / 45) % 8;
  return directions[index];
}

function getUvRating(uv: number | null): { text: string; color: string } {
  if (uv === null || uv === undefined) return { text: 'Not available', color: 'bg-slate-700/50 text-slate-400 border-slate-600' };
  if (uv < 3) return { text: 'Low', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  if (uv < 6) return { text: 'Moderate', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
  if (uv < 8) return { text: 'High', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
  if (uv < 11) return { text: 'Very High', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
  return { text: 'Extreme', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
}

export const WeatherStatsGrid: React.FC<WeatherStatsGridProps> = ({ weather, speedUnit }) => {
  const uvRating = getUvRating(weather.uv_index);
  const compassDir = getCompassDirection(weather.wind_direction);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* 1. Humidity */}
      <MetricCard
        title="Humidity"
        value={weather.humidity}
        unit="%"
        icon={Droplets}
        iconColor="text-cyan-400"
        subtitle={weather.humidity > 70 ? 'High atmospheric moisture' : weather.humidity < 40 ? 'Dry air index' : 'Optimal comfort range'}
        badge={weather.humidity > 80 ? 'Heavy moisture' : undefined}
        badgeColor="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
      />

      {/* 2. Wind Speed */}
      <MetricCard
        title="Wind Speed"
        value={formatSpeed(weather.wind_speed, speedUnit)}
        icon={Wind}
        iconColor="text-sky-400"
        subtitle={`Flowing towards ${compassDir} (${weather.wind_direction}°)`}
        badge={weather.wind_speed > 35 ? 'Gust Warning' : 'Normal flow'}
        badgeColor={weather.wind_speed > 35 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-700/40 text-slate-400 border-slate-600/30'}
      />

      {/* 3. Pressure */}
      <MetricCard
        title="Atm. Pressure"
        value={weather.pressure}
        unit="hPa"
        icon={Gauge}
        iconColor="text-indigo-400"
        subtitle={weather.pressure > 1013 ? 'High pressure system (Stable)' : 'Low pressure trend'}
      />

      {/* 4. Visibility */}
      <MetricCard
        title="Visibility"
        value={weather.visibility ? `${weather.visibility}` : 'Not available'}
        unit={weather.visibility ? 'km' : undefined}
        icon={Eye}
        iconColor="text-emerald-400"
        subtitle={weather.visibility >= 10 ? 'Clear line-of-sight' : 'Haze or mist present'}
      />

      {/* 5. Cloud Coverage */}
      <MetricCard
        title="Cloud Cover"
        value={weather.cloud_coverage}
        unit="%"
        icon={Cloud}
        iconColor="text-blue-300"
        subtitle={weather.cloud_coverage > 75 ? 'Heavy overcast' : weather.cloud_coverage > 25 ? 'Scattered clouds' : 'Clear skies'}
      />

      {/* 6. Precipitation */}
      <MetricCard
        title="Precipitation"
        value={weather.precipitation !== undefined && weather.precipitation !== null ? weather.precipitation : '0.0'}
        unit="mm"
        icon={CloudRain}
        iconColor="text-teal-400"
        subtitle="Recent gauge accumulation"
        badge={weather.precipitation > 5 ? 'Active Rainfall' : undefined}
        badgeColor="bg-teal-500/10 text-teal-400 border-teal-500/20"
      />

      {/* 7. UV Index */}
      <MetricCard
        title="UV Index"
        value={weather.uv_index !== null ? weather.uv_index.toFixed(1) : 'Not available'}
        icon={Sun}
        iconColor="text-amber-400"
        subtitle={weather.uv_index !== null ? `Sun protection: ${uvRating.text}` : 'Not available in feed'}
        badge={weather.uv_index !== null ? uvRating.text : undefined}
        badgeColor={uvRating.color}
      />

      {/* 8. Wind Direction */}
      <MetricCard
        title="Wind Vector"
        value={`${compassDir}`}
        unit={`${weather.wind_direction}°`}
        icon={Compass}
        iconColor="text-violet-400"
        subtitle="Azimuth coordinate"
      />
    </div>
  );
};
