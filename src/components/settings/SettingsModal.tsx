import React from 'react';
import { X, Settings, Thermometer, Wind, Clock, RefreshCw, MapPin, Check } from 'lucide-react';
import { TemperatureUnit, SpeedUnit, TimeFormat } from '../../types/weather';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempUnit: TemperatureUnit;
  onToggleTempUnit: () => void;
  speedUnit: SpeedUnit;
  onToggleSpeedUnit: () => void;
  timeFormat: TimeFormat;
  onToggleTimeFormat: () => void;
  currentCity: string;
  favoriteCities: string[];
  onSelectCity: (city: string) => void;
  isDemo?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  tempUnit,
  onToggleTempUnit,
  speedUnit,
  onToggleSpeedUnit,
  timeFormat,
  onToggleTimeFormat,
  currentCity,
  favoriteCities,
  onSelectCity,
  isDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Application Preferences</h3>
              <p className="text-xs text-slate-400">Configure display units and station parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75dvh]">
          {/* Temperature Unit */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Temperature Unit</span>
                <span className="text-tiny text-slate-400">Choose preferred scale</span>
              </div>
            </div>
            <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-0.5">
              <button
                onClick={onToggleTempUnit}
                className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
                  tempUnit === 'celsius' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                °C (Celsius)
              </button>
              <button
                onClick={onToggleTempUnit}
                className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
                  tempUnit === 'fahrenheit' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                °F (Fahrenheit)
              </button>
            </div>
          </div>

          {/* Wind Speed Unit */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Wind Speed Unit</span>
                <span className="text-tiny text-slate-400">Choose velocity metric</span>
              </div>
            </div>
            <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-0.5">
              <button
                onClick={onToggleSpeedUnit}
                className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
                  speedUnit === 'kmh' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                km/h
              </button>
              <button
                onClick={onToggleSpeedUnit}
                className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
                  speedUnit === 'ms' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                m/s
              </button>
            </div>
          </div>

          {/* Time Format */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Clock Time Format</span>
                <span className="text-tiny text-slate-400">12-hour or 24-hour display</span>
              </div>
            </div>
            <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-0.5">
              <button
                onClick={onToggleTimeFormat}
                className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
                  timeFormat === '12h' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                12-Hour
              </button>
              <button
                onClick={onToggleTimeFormat}
                className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
                  timeFormat === '24h' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                24-Hour
              </button>
            </div>
          </div>

          {/* Active Station Info */}
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Active Target City</span>
              </span>
              <span className="text-xs font-mono font-bold text-sky-300">{currentCity}</span>
            </div>
            <p className="text-tiny text-slate-400">
              Telemetry feed:{' '}
              <span className={isDemo ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
                {isDemo ? 'Demonstration Baseline Sample' : 'Live Sensor Network'}
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
