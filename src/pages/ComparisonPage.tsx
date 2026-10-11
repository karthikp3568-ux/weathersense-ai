import React, { useState, useEffect } from 'react';
import { WeatherData, TemperatureUnit, SpeedUnit } from '../types/weather';
import { compareCitiesData, formatTemperature, formatSpeed } from '../services/weatherService';
import { sendChatMessage } from '../services/aiService';
import { SUPPORTED_CITIES } from '../data/supportedCities';
import {
  GitCompare,
  Sparkles,
  ArrowRight,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  CloudRain,
  Cloud,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ComparisonPageProps {
  tempUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ tempUnit, speedUnit }) => {
  const [city1, setCity1] = useState('Bengaluru');
  const [city2, setCity2] = useState('Mysuru');
  const [data1, setData1] = useState<WeatherData | null>(null);
  const [data2, setData2] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiComparison, setAiComparison] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setAiComparison(null);

    compareCitiesData(city1, city2)
      .then(cities => {
        if (mounted && cities.length >= 2) {
          setData1(cities[0]);
          setData2(cities[1]);
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [city1, city2]);

  const handleRunAiComparison = async () => {
    if (!data1 || !data2) return;
    setIsAiLoading(true);
    try {
      const prompt = `Perform an objective meteorological comparison between ${data1.city} (${data1.temperature}°C, ${data1.humidity}% humidity, ${data1.wind_speed} km/h wind, condition: ${data1.weather_description}) and ${data2.city} (${data2.temperature}°C, ${data2.humidity}% humidity, ${data2.wind_speed} km/h wind, condition: ${data2.weather_description}). Compare thermal comfort, air density/pressure, and precipitation potential.`;
      const res = await sendChatMessage(prompt, data1, `${data1.city} and ${data2.city}`);
      setAiComparison(res.text);
    } catch {
      setAiComparison(
        `Comparative Synthesis (Rule Engine): ${data1.city} is registering ${data1.temperature}°C with ${data1.humidity}% humidity, while ${data2.city} is experiencing ${data2.temperature}°C with ${data2.humidity}% humidity. The thermal delta is ${Math.abs(data1.temperature - data2.temperature).toFixed(1)}°C.`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const chartData = data1 && data2 ? [
    {
      metric: 'Temperature (°C)',
      [data1.city]: data1.temperature,
      [data2.city]: data2.temperature,
    },
    {
      metric: 'Humidity (%)',
      [data1.city]: data1.humidity,
      [data2.city]: data2.humidity,
    },
    {
      metric: 'Wind (km/h)',
      [data1.city]: data1.wind_speed,
      [data2.city]: data2.wind_speed,
    },
    {
      metric: 'Pressure (/10 hPa)',
      [data1.city]: Math.round(data1.pressure / 10),
      [data2.city]: Math.round(data2.pressure / 10),
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header and City Selectors */}
      <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/50 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <GitCompare className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Dual City Meteorological Comparison
              </h2>
              <p className="text-xs text-slate-400">Side-by-side telemetric contrast and AI differential</p>
            </div>
          </div>

          <button
            onClick={handleRunAiComparison}
            disabled={isAiLoading || !data1 || !data2}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isAiLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>AI Comparative Synthesis</span>
          </button>
        </div>

        {/* City selection pills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between gap-3">
            <label className="text-xs font-semibold text-slate-300">Station Alpha:</label>
            <select
              value={city1}
              onChange={e => setCity1(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {SUPPORTED_CITIES.map(c => (
                <option key={`c1-${c.name}`} value={c.name} disabled={c.name === city2}>
                  {c.name} ({c.country})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between gap-3">
            <label className="text-xs font-semibold text-slate-300">Station Beta:</label>
            <select
              value={city2}
              onChange={e => setCity2(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {SUPPORTED_CITIES.map(c => (
                <option key={`c2-${c.name}`} value={c.name} disabled={c.name === city1}>
                  {c.name} ({c.country})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* AI Comparison Response if generated */}
      {aiComparison && (
        <div className="p-6 rounded-3xl bg-purple-950/30 border border-purple-500/30 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Gemini Comparative Evaluation</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {aiComparison}
          </p>
        </div>
      )}

      {/* Side-by-Side Cards */}
      {data1 && data2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-800/60 border border-sky-500/30 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-micro font-bold text-sky-400 uppercase tracking-wider block">Station Alpha</span>
                <h3 className="text-2xl font-black text-white">{data1.city}</h3>
                <span className="text-xs text-slate-400">{data1.country}</span>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black font-mono text-white">
                  {formatTemperature(data1.temperature, tempUnit)}
                </span>
                <span className="text-xs text-slate-300 block capitalize">{data1.weather_description}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-700/50">
              <div className="p-2.5 rounded-xl bg-slate-900/50">
                <span className="text-slate-400 block text-micro">Humidity</span>
                <span className="font-bold text-white font-mono">{data1.humidity}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50">
                <span className="text-slate-400 block text-micro">Wind Speed</span>
                <span className="font-bold text-white font-mono">{formatSpeed(data1.wind_speed, speedUnit)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50">
                <span className="text-slate-400 block text-micro">Atm. Pressure</span>
                <span className="font-bold text-white font-mono">{data1.pressure} hPa</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50">
                <span className="text-slate-400 block text-micro">Cloud Cover</span>
                <span className="font-bold text-white font-mono">{data1.cloud_coverage}%</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-800/60 border border-purple-500/30 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-micro font-bold text-purple-400 uppercase tracking-wider block">Station Beta</span>
                <h3 className="text-2xl font-black text-white">{data2.city}</h3>
                <span className="text-xs text-slate-400">{data2.country}</span>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black font-mono text-white">
                  {formatTemperature(data2.temperature, tempUnit)}
                </span>
                <span className="text-xs text-slate-300 block capitalize">{data2.weather_description}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-700/50">
              <div className="p-2.5 rounded-xl bg-slate-900/50">
                <span className="text-slate-400 block text-micro">Humidity</span>
                <span className="font-bold text-white font-mono">{data2.humidity}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50">
                <span className="text-slate-400 block text-micro">Wind Speed</span>
                <span className="font-bold text-white font-mono">{formatSpeed(data2.wind_speed, speedUnit)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50">
                <span className="text-slate-400 block text-micro">Atm. Pressure</span>
                <span className="font-bold text-white font-mono">{data2.pressure} hPa</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50">
                <span className="text-slate-400 block text-micro">Cloud Cover</span>
                <span className="font-bold text-white font-mono">{data2.cloud_coverage}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Chart Canvas */}
      {chartData.length > 0 && (
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/50">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Normalized Parameter Differential
            </h3>
            <span className="text-micro text-slate-400 font-mono">Comparative Sensor Scale</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                <Legend />
                <Bar dataKey={data1?.city || 'City 1'} fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey={data2?.city || 'City 2'} fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
