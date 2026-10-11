import React, { useState } from 'react';
import { useWeather } from './hooks/useWeather';
import { useTheme } from './hooks/useTheme';
import { useAlerts } from './hooks/useAlerts';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { StatusBanner } from './components/common/StatusBanner';
import { CitySearchModal } from './components/weather/CitySearchModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastPage } from './pages/ForecastPage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { AIChatPage } from './pages/AIChatPage';
import { AlertsPage } from './pages/AlertsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { MapPage } from './pages/MapPage';
import { IoTPage } from './pages/IoTPage';

export default function App() {
  const {
    selectedCity,
    setSelectedCity,
    weather,
    forecast,
    isLoading,
    isRefreshing,
    error,
    refresh,
    tempUnit,
    setTempUnit,
    speedUnit,
    setSpeedUnit,
    timeFormat,
    setTimeFormat,
    favoriteCities,
    toggleFavorite,
    isFavorite,
    requestGeolocation,
  } = useWeather();

  const { theme, toggleTheme, isDark } = useTheme();
  const { alerts, thresholds, updateThresholds, acknowledgeAlert, activeAlertsCount } = useAlerts(weather);

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleTempUnit = () => {
    setTempUnit(prev => (prev === 'celsius' ? 'fahrenheit' : 'celsius'));
  };

  const handleToggleSpeedUnit = () => {
    setSpeedUnit(prev => (prev === 'kmh' ? 'ms' : 'kmh'));
  };

  const handleToggleTimeFormat = () => {
    setTimeFormat(prev => (prev === '12h' ? '24h' : '12h'));
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      {/* 1. Status Banner (Live vs Demo Mode) */}
      <StatusBanner
        dataSource={weather?.data_source}
        isDemo={weather?.is_demo}
      />

      {/* 2. Top Navigation Header */}
      <Header
        currentCity={weather?.city || selectedCity}
        country={weather?.country || 'India'}
        onOpenSearch={() => setIsSearchOpen(true)}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        activeAlertsCount={activeAlertsCount}
        onOpenAlerts={() => setActiveTab('alerts')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        tempUnit={tempUnit}
        onToggleTempUnit={handleToggleTempUnit}
        speedUnit={speedUnit}
        onToggleSpeedUnit={handleToggleSpeedUnit}
        timeFormat={timeFormat}
        onToggleTimeFormat={handleToggleTimeFormat}
        onToggleSidebarMobile={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      {/* 3. Main Body: Sidebar + Dynamic Content Canvas */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          mobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          activeAlertsCount={activeAlertsCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              weather={weather}
              forecast={forecast}
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              error={error}
              onRefresh={refresh}
              tempUnit={tempUnit}
              speedUnit={speedUnit}
              timeFormat={timeFormat}
              isFavorite={isFavorite(weather?.city || selectedCity)}
              onToggleFavorite={() => toggleFavorite(weather?.city || selectedCity)}
              onNavigateTab={tab => setActiveTab(tab)}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastPage
              forecast={forecast}
              isLoading={isLoading}
              tempUnit={tempUnit}
              speedUnit={speedUnit}
              timeFormat={timeFormat}
            />
          )}

          {activeTab === 'ai-analysis' && (
            <AIAnalysisPage weather={weather} forecast={forecast} />
          )}

          {activeTab === 'ai-chat' && (
            <AIChatPage weather={weather} />
          )}

          {activeTab === 'alerts' && (
            <AlertsPage
              alerts={alerts}
              thresholds={thresholds}
              onUpdateThresholds={updateThresholds}
              onAcknowledgeAlert={acknowledgeAlert}
            />
          )}

          {activeTab === 'history' && (
            <HistoryPage
              currentCity={weather?.city || selectedCity}
              tempUnit={tempUnit}
            />
          )}

          {activeTab === 'comparison' && (
            <ComparisonPage
              tempUnit={tempUnit}
              speedUnit={speedUnit}
            />
          )}

          {activeTab === 'map' && (
            <MapPage
              weather={weather}
              tempUnit={tempUnit}
              onSelectCity={city => {
                setSelectedCity(city);
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'iot' && (
            <IoTPage tempUnit={tempUnit} />
          )}
        </main>
      </div>

      {/* 4. Footer */}
      <Footer />

      {/* 5. City Search Modal */}
      <CitySearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCity={city => setSelectedCity(city)}
        currentCity={weather?.city || selectedCity}
        favoriteCities={favoriteCities}
        onToggleFavorite={toggleFavorite}
        onRequestGeolocation={requestGeolocation}
      />

      {/* 6. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        tempUnit={tempUnit}
        onToggleTempUnit={handleToggleTempUnit}
        speedUnit={speedUnit}
        onToggleSpeedUnit={handleToggleSpeedUnit}
        timeFormat={timeFormat}
        onToggleTimeFormat={handleToggleTimeFormat}
        currentCity={weather?.city || selectedCity}
        favoriteCities={favoriteCities}
        onSelectCity={city => setSelectedCity(city)}
        isDemo={weather?.is_demo}
      />
    </div>
  );
}
