import React from 'react';
import {
  LayoutDashboard,
  CloudSun,
  BrainCircuit,
  MessageSquare,
  AlertTriangle,
  History,
  GitCompare,
  Map,
  Cpu,
  X,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'forecast'
  | 'ai-analysis'
  | 'ai-chat'
  | 'alerts'
  | 'history'
  | 'comparison'
  | 'map'
  | 'iot';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  activeAlertsCount,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number | string; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'forecast', label: 'Forecast & Trends', icon: CloudSun },
    { id: 'ai-analysis', label: 'AI Weather Analysis', icon: BrainCircuit, badge: 'AI', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { id: 'ai-chat', label: 'AI Chat Assistant', icon: MessageSquare },
    { id: 'alerts', label: 'Weather Alerts', icon: AlertTriangle, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined, badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { id: 'history', label: 'Historical Analytics', icon: History },
    { id: 'comparison', label: 'City Comparison', icon: GitCompare },
    { id: 'map', label: 'Interactive Map', icon: Map },
    { id: 'iot', label: 'IoT Weather Station', icon: Cpu, badge: 'ESP32', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 md:top-(--header-h) left-0 z-50 md:z-30 h-dvh md:h-[calc(100dvh-var(--header-h))] w-64 max-w-[85vw] bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Mobile header */}
        <div className="p-4 flex md:hidden items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">Navigation</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-tiny font-semibold text-slate-400 uppercase tracking-wider">
            Meteorological Modules
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-sky-500/15 text-white font-semibold border border-sky-500/30 shadow-md shadow-sky-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-sky-500 text-white'
                        : 'text-slate-400 group-hover:text-sky-400 bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-micro font-bold px-1.5 py-0.5 rounded-full border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom card: System status badge */}
        <div className="p-3 border-t border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-tiny font-semibold text-slate-300">System Architecture</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-micro text-slate-400 leading-relaxed">
              Full-Stack Node/Express + React 19 + Recharts + Leaflet + Gemini API.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
