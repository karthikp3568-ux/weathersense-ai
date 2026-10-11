import { useState, useEffect, useCallback } from 'react';
import { WeatherAlert, AlertThresholdConfig, WeatherData } from '../types/weather';
import { SAMPLE_ALERTS } from '../data/sampleData';
import { apiRequest } from '../services/api';

const DEFAULT_THRESHOLDS: AlertThresholdConfig = {
  temp_high_c: 35.0,
  temp_low_c: 12.0,
  wind_speed_kmh: 30.0,
  humidity_high_pct: 80.0,
  rain_heavy_mm: 10.0,
  enabled: true,
};

export function useAlerts(currentWeather: WeatherData | null) {
  const [thresholds, setThresholds] = useState<AlertThresholdConfig>(() => {
    try {
      const saved = localStorage.getItem('weathersense_thresholds');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_THRESHOLDS;
  });

  const [alerts, setAlerts] = useState<WeatherAlert[]>(() => {
    return SAMPLE_ALERTS;
  });

  // Save thresholds
  useEffect(() => {
    localStorage.setItem('weathersense_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  // Load from backend if available
  useEffect(() => {
    let mounted = true;
    apiRequest<{ alerts: WeatherAlert[] }>('/alerts')
      .then(res => {
        if (mounted && res?.alerts) {
          setAlerts(res.alerts);
        }
      })
      .catch(() => {
        // keep sample alerts
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Dynamically evaluate current weather against active thresholds
  useEffect(() => {
    if (!currentWeather || !thresholds.enabled) return;

    const dynamicAlerts: WeatherAlert[] = [];

    // High temperature
    if (currentWeather.temperature >= thresholds.temp_high_c) {
      dynamicAlerts.push({
        id: `dyn-temp-high-${currentWeather.city}-${Date.now()}`,
        title: `High Temperature Alert (> ${thresholds.temp_high_c}°C)`,
        location: currentWeather.city,
        severity: currentWeather.temperature > thresholds.temp_high_c + 3 ? 'severe' : 'warning',
        condition_type: 'temperature_high',
        trigger_value: currentWeather.temperature,
        threshold_value: thresholds.temp_high_c,
        unit: '°C',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data_source: currentWeather.is_demo ? 'Demo Threshold Engine' : 'Live Sensor Monitoring',
        precaution: 'Drink plenty of water, avoid extended sun exposure, and utilize shade or climate control.',
        acknowledged: false,
        is_system_alert: true,
      });
    }

    // High wind
    if (currentWeather.wind_speed >= thresholds.wind_speed_kmh) {
      dynamicAlerts.push({
        id: `dyn-wind-${currentWeather.city}-${Date.now()}`,
        title: `High Wind Speed Alert (> ${thresholds.wind_speed_kmh} km/h)`,
        location: currentWeather.city,
        severity: currentWeather.wind_speed > thresholds.wind_speed_kmh + 15 ? 'warning' : 'advisory',
        condition_type: 'wind_speed',
        trigger_value: currentWeather.wind_speed,
        threshold_value: thresholds.wind_speed_kmh,
        unit: 'km/h',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data_source: currentWeather.is_demo ? 'Demo Threshold Engine' : 'Live Sensor Monitoring',
        precaution: 'Secure loose outdoor items, exercise caution while cycling or driving high-profile vehicles.',
        acknowledged: false,
        is_system_alert: true,
      });
    }

    // High humidity
    if (currentWeather.humidity >= thresholds.humidity_high_pct) {
      dynamicAlerts.push({
        id: `dyn-hum-${currentWeather.city}-${Date.now()}`,
        title: `Elevated Relative Humidity (> ${thresholds.humidity_high_pct}%)`,
        location: currentWeather.city,
        severity: 'advisory',
        condition_type: 'humidity_high',
        trigger_value: currentWeather.humidity,
        threshold_value: thresholds.humidity_high_pct,
        unit: '%',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data_source: currentWeather.is_demo ? 'Demo Threshold Engine' : 'Live Sensor Monitoring',
        precaution: 'Increased heat index effect. Maintain indoor ventilation.',
        acknowledged: false,
        is_system_alert: true,
      });
    }

    if (dynamicAlerts.length > 0) {
      setAlerts(prev => {
        // Avoid duplicate condition alerts for same city
        const filtered = prev.filter(a => !dynamicAlerts.some(da => da.condition_type === a.condition_type && da.location === a.location));
        return [...dynamicAlerts, ...filtered];
      });
    }
  }, [currentWeather, thresholds]);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, acknowledged: true } : a)));
    // Also notify backend if reachable
    apiRequest('/alerts/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ alertId: id }),
    }).catch(() => {
      // ignore
    });
  }, []);

  const updateThresholds = useCallback((newConfig: Partial<AlertThresholdConfig>) => {
    setThresholds(prev => ({ ...prev, ...newConfig }));
  }, []);

  const activeAlertsCount = alerts.filter(a => !a.acknowledged).length;

  return {
    alerts,
    thresholds,
    updateThresholds,
    acknowledgeAlert,
    activeAlertsCount,
  };
}
