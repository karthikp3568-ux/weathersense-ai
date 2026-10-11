import React, { useState, useEffect, useRef } from 'react';
import {
  CloudSun,
  Search,
  Bell,
  RefreshCw,
  Settings,
  MapPin,
} from 'lucide-react';
import { TemperatureUnit, SpeedUnit, TimeFormat } from '../../types/weather';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  currentCity: string;
  country: string;
  onOpenSearch: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  activeAlertsCount: number;
  onOpenAlerts: () => void;
  onOpenSettings: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  tempUnit: TemperatureUnit;
  onToggleTempUnit: () => void;
  speedUnit: SpeedUnit;
  onToggleSpeedUnit: () => void;
  timeFormat: TimeFormat;
  onToggleTimeFormat: () => void;
  onToggleSidebarMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  country,
  onOpenSearch,
  onRefresh,
  isRefreshing,
  activeAlertsCount,
  onOpenAlerts,
  onOpenSettings,
  isDark,
  onToggleTheme,
  tempUnit,
  onToggleTempUnit,
  speedUnit,
  onToggleSpeedUnit,
  onToggleSidebarMobile,
}) => {
  const headerRef = useRef<HTMLElement>(null);

  // Publish the real header height (it changes with screen size and font scaling)
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 transition-colors">
      <div className="px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile menu toggle + Logo + Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleSidebarMobile}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-amber-400 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <CloudSun className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">WeatherSense</span>
                <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">AI</span>
              </div>
              <p className="text-micro text-slate-400 font-medium hidden sm:block">
                Intelligent Weather Monitoring &amp; Forecasting
              </p>
            </div>
          </div>
        </div>

        {/* Center: City Search Trigger Pill */}
        <div className="flex-1 min-w-0 max-w-xs sm:max-w-md sm:mx-2">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between gap-2 px-3 sm:px-3.5 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-sky-500/50 text-slate-300 hover:text-white transition-all shadow-inner group cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-white truncate">{currentCity}</span>
              {country && (
                <span className="text-tiny text-slate-400 truncate hidden sm:inline">
                  ({country})
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs shrink-0">
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-tiny">Search city...</span>
            </div>
          </button>
        </div>

        {/* Right: Live Clock, Units, Refresh, Alerts, Theme, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live Date/Time Badge */}
          <div className="hidden xl:flex flex-col items-end text-right px-2.5 py-1 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-xs font-mono font-bold text-sky-300">{currentTime}</span>
            <span className="text-micro text-slate-400">{currentDate}</span>
          </div>

          {/* Unit Switcher Button */}
          <div className="hidden sm:flex items-center bg-slate-800/80 border border-slate-700/60 rounded-xl p-0.5">
            <button
              onClick={onToggleTempUnit}
              className="px-2 py-1 text-xs font-bold font-mono rounded-lg transition-all text-slate-300 hover:text-white cursor-pointer"
              title="Toggle Celsius / Fahrenheit"
            >
              {tempUnit === 'celsius' ? '°C' : '°F'}
            </button>
            <button
              onClick={onToggleSpeedUnit}
              className="px-2 py-1 text-micro font-medium font-mono text-slate-400 hover:text-white transition-all border-l border-slate-700 cursor-pointer"
              title="Toggle km/h / m/s"
            >
              {speedUnit}
            </button>
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh current meteorological observation"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Notifications / Alerts Bell */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer shadow-sm active:scale-95"
            title="View Weather Alerts"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-micro font-bold text-white flex items-center justify-center shadow-lg animate-pulse">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

          {/* Settings / Integration Guide */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Application Preferences & Settings"
          >
            <Settings className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
