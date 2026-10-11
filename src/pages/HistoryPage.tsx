import React, { useState, useEffect } from 'react';
import { HistoricalRecord, TemperatureUnit } from '../types/weather';
import { SAMPLE_HISTORICAL_DATA } from '../data/sampleData';
import { SUPPORTED_CITIES } from '../data/supportedCities';
import { apiRequest } from '../services/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  History,
  Download,
  Calendar,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  MapPin,
  TrendingUp,
} from 'lucide-react';

interface HistoryPageProps {
  currentCity: string;
  tempUnit: TemperatureUnit;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ currentCity, tempUnit }) => {
  const [selectedCity, setSelectedCity] = useState(currentCity);
  const [rangeDays, setRangeDays] = useState<number>(14);
  const [records, setRecords] = useState<HistoricalRecord[]>(SAMPLE_HISTORICAL_DATA);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    apiRequest<{ records: HistoricalRecord[] }>(`/history?city=${encodeURIComponent(selectedCity)}`)
      .then(res => {
        if (mounted && res?.records) {
          setRecords(res.records.slice(-rangeDays));
        }
      })
      .catch(() => {
        if (mounted) {
          setRecords(SAMPLE_HISTORICAL_DATA.slice(-rangeDays));
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedCity, rangeDays]);

  // Derived metrics
  const avgTemp = records.length > 0 ? (records.reduce((acc, r) => acc + r.temp_avg, 0) / records.length).toFixed(1) : '0';
  const maxTemp = records.length > 0 ? Math.max(...records.map(r => r.temp_max)).toFixed(1) : '0';
  const minTemp = records.length > 0 ? Math.min(...records.map(r => r.temp_min)).toFixed(1) : '0';
  const totalRain = records.length > 0 ? records.reduce((acc, r) => acc + r.precipitation_mm, 0).toFixed(1) : '0';
  const avgHumidity = records.length > 0 ? (records.reduce((acc, r) => acc + r.humidity_avg, 0) / records.length).toFixed(0) : '0';

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Date', 'Max Temp (C)', 'Min Temp (C)', 'Avg Temp (C)', 'Avg Humidity (%)', 'Avg Wind Speed (km/h)', 'Rainfall (mm)', 'Condition'];
    const rows = records.map(r => [
      r.date,
      r.temp_max,
      r.temp_min,
      r.temp_avg,
      r.humidity_avg,
      r.wind_speed_avg,
      r.precipitation_mm,
      r.condition,
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `WeatherSense_Historical_${selectedCity}_${rangeDays}Days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Historical Meteorological Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Climate trajectory archive, historical curves, and tabular CSV export
          </p>
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-3">
          {/* City selector */}
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {SUPPORTED_CITIES.map(c => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Range days selector */}
          <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-0.5 text-xs font-semibold">
            {[7, 14].map(days => (
              <button
                key={days}
                onClick={() => setRangeDays(days)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  rangeDays === days ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Demo dataset disclaimer banner */}
      <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center justify-between">
        <span>DEMO DATASET — Showing verified baseline climate observations for academic research and trend testing.</span>
        <span className="font-mono text-tiny text-amber-300">Station Archive</span>
      </div>

      {/* Aggregate Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
          <span className="text-micro font-semibold text-slate-400 uppercase tracking-wider block">Average Temp</span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">{avgTemp}°C</span>
          <span className="text-micro text-slate-400">Past {rangeDays} days</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
          <span className="text-micro font-semibold text-slate-400 uppercase tracking-wider block">Peak Maximum</span>
          <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">{maxTemp}°C</span>
          <span className="text-micro text-slate-400">High recorded</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
          <span className="text-micro font-semibold text-slate-400 uppercase tracking-wider block">Minimum Recorded</span>
          <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">{minTemp}°C</span>
          <span className="text-micro text-slate-400">Low recorded</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
          <span className="text-micro font-semibold text-slate-400 uppercase tracking-wider block">Total Precipitation</span>
          <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">{totalRain} mm</span>
          <span className="text-micro text-slate-400">Cumulative rainfall</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
          <span className="text-micro font-semibold text-slate-400 uppercase tracking-wider block">Mean Humidity</span>
          <span className="text-2xl font-bold font-mono text-teal-400 mt-1 block">{avgHumidity}%</span>
          <span className="text-micro text-slate-400">Atmospheric moisture</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Temperature Bounds Over Time */}
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/50">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span>Historical Temperature Extremes</span>
            </h3>
            <span className="text-micro text-slate-400 font-mono">Max vs Min (°C)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={records} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="histTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={d => d.substring(5)} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={['dataMin - 3', 'dataMax + 3']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="temp_max" stroke="#f43f5e" strokeWidth={2} name="Max Temp (°C)" fill="url(#histTemp)" />
                <Area type="monotone" dataKey="temp_min" stroke="#38bdf8" strokeWidth={2} name="Min Temp (°C)" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Historical Rainfall Accumulation */}
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/50">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <span>Daily Precipitation Accumulation</span>
            </h3>
            <span className="text-micro text-slate-400 font-mono">Gauge Depth (mm)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={records} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={d => d.substring(5)} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="precipitation_mm" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Precipitation (mm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Mean Humidity Over Time */}
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/50">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>Daily Mean Relative Humidity</span>
            </h3>
            <span className="text-micro text-slate-400 font-mono">Saturation (%)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={records} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={d => d.substring(5)} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[30, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="humidity_avg" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 3 }} name="Avg Humidity (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Wind Speed Trajectory */}
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/50">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Wind className="w-4 h-4 text-sky-400" />
              <span>Mean Surface Wind Velocity</span>
            </h3>
            <span className="text-micro text-slate-400 font-mono">Speed (km/h)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={records} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="histWind" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={d => d.substring(5)} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={['dataMin - 2', 'dataMax + 4']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="wind_speed_avg" stroke="#38bdf8" strokeWidth={2.5} fill="url(#histWind)" name="Avg Wind (km/h)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
