import React from 'react';
import { WeatherData, ForecastData, TemperatureUnit, SpeedUnit, TimeFormat } from '../types/weather';
import { CurrentWeatherCard } from '../components/weather/CurrentWeatherCard';
import { WeatherStatsGrid } from '../components/weather/WeatherStatsGrid';
import { SunMoonCard } from '../components/weather/SunMoonCard';
import { ForecastStrip } from '../components/weather/ForecastStrip';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Sparkles, MessageSquare, AlertTriangle, ArrowRight, Activity } from 'lucide-react';

interface DashboardPageProps {
  weather: WeatherData | null;
  forecast: ForecastData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  onRefresh: () => void;
  tempUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
  timeFormat: TimeFormat;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onNavigateTab: (tab: 'forecast' | 'ai-analysis' | 'ai-chat' | 'alerts' | 'map' | 'iot') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  weather,
  forecast,
  isLoading,
  isRefreshing,
  error,
  onRefresh,
  tempUnit,
  speedUnit,
  timeFormat,
  isFavorite,
  onToggleFavorite,
  onNavigateTab,
}) => {
  if (isLoading && !weather) {
    return <LoadingSkeleton />;
  }

  if (error && !weather) {
    return <ErrorMessage message={error} onRetry={onRefresh} />;
  }

  if (!weather) return null;

  return (
    <div className="space-y-6">
      {/* 1. Main Weather Card */}
      <CurrentWeatherCard
        weather={weather}
        tempUnit={tempUnit}
        speedUnit={speedUnit}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      {/* 2. Weather Statistics Grid (8 Metrics) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>Atmospheric Telemetry &amp; Physical Sensors</span>
          </h2>
          <span className="text-tiny text-slate-400 font-mono">Calibrated WMO standards</span>
        </div>
        <WeatherStatsGrid weather={weather} speedUnit={speedUnit} />
      </div>

      {/* 3. Solar Daylight Cycle and AI Teaser Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <SunMoonCard weather={weather} timeFormat={timeFormat} />
        </div>

        {/* AI Quick Analysis Card */}
        <div className="lg:col-span-6 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Gemini AI Weather Synthesis</h3>
                  <p className="text-micro text-purple-300/80">Automated meteorological reasoning</p>
                </div>
              </div>
              <span className="text-micro font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                AI Ready
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              WeatherSense AI integrates Google Gemini to decode barometric shifts, heat index variances, and produce practical agricultural and urban precautions.
            </p>

            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 font-medium italic">
              &quot;Conditions in {weather.city} feature {weather.weather_description} with {weather.temperature}°C ambient reading. Thermal indices suggest nominal comfort.&quot;
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab('ai-analysis')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full AI Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigateTab('ai-chat')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>Chat Assistant</span>
            </button>

            <button
              onClick={() => onNavigateTab('alerts')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Alert Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Forecast Strip (7-day synopsis) */}
      {forecast && (
        <ForecastStrip
          daily={forecast.daily}
          tempUnit={tempUnit}
          onViewForecastDetails={() => onNavigateTab('forecast')}
        />
      )}
    </div>
  );
};
