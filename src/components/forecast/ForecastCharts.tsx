import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ForecastData, TemperatureUnit, SpeedUnit } from '../../types/weather';
import { formatTemperature, formatSpeed } from '../../services/weatherService';
import { Thermometer, Droplets, Wind, CloudRain } from 'lucide-react';

interface ForecastChartsProps {
  forecast: ForecastData;
  tempUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
}

type ChartTab = 'temperature' | 'humidity' | 'wind' | 'precipitation';

export const ForecastCharts: React.FC<ForecastChartsProps> = ({
  forecast,
  tempUnit,
  speedUnit,
}) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('temperature');

  const chartData = forecast.hourly.map(item => ({
    time: item.time,
    temperature: tempUnit === 'fahrenheit' ? Math.round(((item.temp * 9) / 5 + 32) * 10) / 10 : item.temp,
    feels_like: tempUnit === 'fahrenheit' ? Math.round(((item.feels_like * 9) / 5 + 32) * 10) / 10 : item.feels_like,
    humidity: item.humidity,
    wind_speed: speedUnit === 'ms' ? Math.round((item.wind_speed / 3.6) * 10) / 10 : item.wind_speed,
    precipitation_prob: item.precipitation_prob,
    rain_mm: item.rain_mm,
  }));

  return (
    <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
      {/* Header and Chart Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-700/50">
        <div>
          <h3 className="text-base font-bold text-white">Meteorological Parameter Trends</h3>
          <p className="text-xs text-slate-400">Interactive hourly trajectory visualization</p>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-slate-700/60">
          <button
            onClick={() => setActiveTab('temperature')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'temperature'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temperature</span>
          </button>

          <button
            onClick={() => setActiveTab('humidity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'humidity'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Humidity</span>
          </button>

          <button
            onClick={() => setActiveTab('wind')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'wind'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind Speed</span>
          </button>

          <button
            onClick={() => setActiveTab('precipitation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'precipitation'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Precipitation</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'temperature' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [
                  typeof val === 'number' ? formatTemperature(val, tempUnit) : String(val ?? ''),
                  'Temperature',
                ]}
              />
              <Area type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#tempGradient)" />
            </AreaChart>
          ) : activeTab === 'humidity' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [`${val ?? ''}%`, 'Relative Humidity']}
              />
              <Line type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 4 }} />
            </LineChart>
          ) : activeTab === 'wind' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={['dataMin - 2', 'dataMax + 4']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [
                  typeof val === 'number' ? formatSpeed(val, speedUnit) : String(val ?? ''),
                  'Wind Velocity',
                ]}
              />
              <Area type="monotone" dataKey="wind_speed" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#windGradient)" />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [`${val ?? ''} mm`, 'Rain Accumulation']}
              />
              <Bar dataKey="rain_mm" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
