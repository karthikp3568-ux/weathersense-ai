import React, { useState } from 'react';
import { WeatherAlert, AlertThresholdConfig, AlertSeverity } from '../types/weather';
import {
  AlertTriangle,
  ShieldAlert,
  Bell,
  CheckCircle2,
  Sliders,
  Info,
  Clock,
  Thermometer,
  Wind,
  Droplets,
  CloudRain,
  MapPin,
  Check,
} from 'lucide-react';

interface AlertsPageProps {
  alerts: WeatherAlert[];
  thresholds: AlertThresholdConfig;
  onUpdateThresholds: (cfg: Partial<AlertThresholdConfig>) => void;
  onAcknowledgeAlert: (id: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  thresholds,
  onUpdateThresholds,
  onAcknowledgeAlert,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showConfig, setShowConfig] = useState(false);

  // Local state for threshold adjustments
  const [tempHigh, setTempHigh] = useState(thresholds.temp_high_c);
  const [windHigh, setWindHigh] = useState(thresholds.wind_speed_kmh);
  const [humidityHigh, setHumidityHigh] = useState(thresholds.humidity_high_pct);
  const [rainHigh, setRainHigh] = useState(thresholds.rain_heavy_mm);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateThresholds({
      temp_high_c: tempHigh,
      wind_speed_kmh: windHigh,
      humidity_high_pct: humidityHigh,
      rain_heavy_mm: rainHigh,
    });
    setShowConfig(false);
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'all') return true;
    if (filterSeverity === 'unacknowledged') return !a.acknowledged;
    return a.severity === filterSeverity;
  });

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'severe':
        return {
          label: 'Severe Alert',
          classes: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'warning':
        return {
          label: 'Warning',
          classes: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'advisory':
        return {
          label: 'Advisory',
          classes: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        };
      default:
        return {
          label: 'Information',
          classes: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Automated Weather Alert &amp; Threshold Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-variable condition evaluation with customizable safety limits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>{showConfig ? 'Hide Threshold Config' : 'Configure Thresholds'}</span>
          </button>
        </div>
      </div>

      {/* Distinction & Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Notice on Meteorological Authority:</strong> These alerts are generated locally by the application&apos;s computational rule engine comparing current sensor measurements against user-defined parameter thresholds. They represent engineering monitoring triggers, distinct from official national meteorological warnings.
        </div>
      </div>

      {/* Threshold Configuration Drawer */}
      {showConfig && (
        <form
          onSubmit={handleSaveThresholds}
          className="bg-slate-900/90 border border-sky-500/30 rounded-3xl p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Configure Autonomous Alarm Triggers</span>
            </h3>
            <span className="text-tiny text-slate-400">Values applied dynamically</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Temp High */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <label className="text-xs text-slate-300 font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" /> High Temp
                </span>
                <span className="font-mono text-amber-400">{tempHigh}°C</span>
              </label>
              <input
                type="range"
                min="25"
                max="50"
                step="0.5"
                value={tempHigh}
                onChange={e => setTempHigh(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
              <span className="text-micro text-slate-400 block">Trigger alert if &ge; {tempHigh}°C</span>
            </div>

            {/* Wind High */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <label className="text-xs text-slate-300 font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-sky-400" /> Wind Velocity
                </span>
                <span className="font-mono text-sky-400">{windHigh} km/h</span>
              </label>
              <input
                type="range"
                min="15"
                max="80"
                step="1"
                value={windHigh}
                onChange={e => setWindHigh(parseFloat(e.target.value))}
                className="w-full accent-sky-500"
              />
              <span className="text-micro text-slate-400 block">Trigger alert if &ge; {windHigh} km/h</span>
            </div>

            {/* Humidity High */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <label className="text-xs text-slate-300 font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Relative Humidity
                </span>
                <span className="font-mono text-cyan-400">{humidityHigh}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="99"
                step="1"
                value={humidityHigh}
                onChange={e => setHumidityHigh(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <span className="text-micro text-slate-400 block">Trigger advisory if &ge; {humidityHigh}%</span>
            </div>

            {/* Rain Heavy */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <label className="text-xs text-slate-300 font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" /> Rain Rate
                </span>
                <span className="font-mono text-blue-400">{rainHigh} mm</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={rainHigh}
                onChange={e => setRainHigh(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <span className="text-micro text-slate-400 block">Trigger alert if &ge; {rainHigh} mm/hr</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Save Thresholds
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'unacknowledged', 'severe', 'warning', 'advisory', 'info'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white bg-slate-800/40'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredAlerts.length} record{filteredAlerts.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map(alert => {
          const badge = getSeverityBadge(alert.severity);

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-3xl border transition-all ${
                alert.acknowledged
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
                  : 'bg-slate-800/70 border-slate-700/60 shadow-lg'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-micro font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badge.classes}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-400" />
                      <span>{alert.location}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{alert.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{alert.timestamp}</span>
                  </div>

                  {!alert.acknowledged ? (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Acknowledge</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                    </span>
                  )}
                </div>
              </div>

              {/* Condition breakdown values */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-micro">Triggered Metric Value</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {alert.trigger_value} {alert.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-micro">Configured Alarm Threshold</span>
                  <span className="font-mono font-semibold text-slate-300">
                    {alert.threshold_value} {alert.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-micro">Telemetric Source</span>
                  <span className="font-medium text-slate-300">{alert.data_source}</span>
                </div>
              </div>

              {/* Precaution */}
              <div className="pt-2 text-xs text-slate-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-200">Recommended Precaution:</strong> {alert.precaution}
                </p>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-slate-800/30 rounded-3xl border border-slate-700/40">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-white">No alerts currently match filter</p>
            <p className="text-xs text-slate-400 mt-1">All telemetry parameters remain within configured baseline limits.</p>
          </div>
        )}
      </div>
    </div>
  );
};
