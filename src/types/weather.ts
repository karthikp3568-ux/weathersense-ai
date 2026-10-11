export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type SpeedUnit = 'kmh' | 'ms';
export type TimeFormat = '12h' | '24h';
export type ThemeMode = 'dark' | 'light';

export type DataSource = 'live_openweather' | 'live_openmeteo' | 'demo_sample';

export interface WeatherData {
  city: string;
  country: string;
  lat: number;
  lon: number;
  temperature: number; // always stored in Celsius
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number; // percentage
  pressure: number; // hPa
  wind_speed: number; // km/h
  wind_direction: number; // degrees
  cloud_coverage: number; // percentage
  visibility: number; // km
  precipitation: number; // mm in last hour/day
  uv_index: number | null;
  weather_main: string; // "Clear", "Clouds", "Rain", etc.
  weather_description: string;
  weather_icon: string; // lucide icon identifier
  sunrise: string; // ISO or formatted
  sunset: string;
  last_updated: string;
  data_source: DataSource;
  is_demo: boolean;
}

export interface HourlyForecast {
  time: string; // "14:00" or ISO
  hour: number;
  temp: number;
  feels_like: number;
  weather_main: string;
  weather_description: string;
  weather_icon: string;
  humidity: number;
  wind_speed: number;
  precipitation_prob: number; // 0-100%
  rain_mm: number;
}

export interface DailyForecast {
  date: string; // "2026-10-12"
  day_name: string; // "Mon", "Tue"
  temp_min: number;
  temp_max: number;
  weather_main: string;
  weather_description: string;
  weather_icon: string;
  humidity: number;
  wind_speed: number;
  precipitation_prob: number;
  rain_mm: number;
  sunrise: string;
  sunset: string;
}

export interface ForecastData {
  city: string;
  country: string;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  data_source: DataSource;
  is_demo: boolean;
}

export type AlertSeverity = 'info' | 'advisory' | 'warning' | 'severe';
export type AlertConditionType =
  | 'temperature_high'
  | 'temperature_low'
  | 'wind_speed'
  | 'humidity_high'
  | 'precipitation_heavy'
  | 'pressure_drop';

export interface WeatherAlert {
  id: string;
  title: string;
  location: string;
  severity: AlertSeverity;
  condition_type: AlertConditionType;
  trigger_value: number;
  threshold_value: number;
  unit: string;
  timestamp: string;
  data_source: string;
  precaution: string;
  acknowledged: boolean;
  is_system_alert: boolean; // distinguishing app threshold alerts from official met warnings
}

export interface AlertThresholdConfig {
  temp_high_c: number;
  temp_low_c: number;
  wind_speed_kmh: number;
  humidity_high_pct: number;
  rain_heavy_mm: number;
  enabled: boolean;
}

export interface HistoricalRecord {
  date: string;
  temp_max: number;
  temp_min: number;
  temp_avg: number;
  humidity_avg: number;
  wind_speed_avg: number;
  precipitation_mm: number;
  condition: string;
}

export interface IoTStationData {
  station_id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'demo';
  last_reading_time: string;
  temperature: number;
  humidity: number;
  pressure: number;
  rain_detected: boolean;
  wind_speed: number;
  battery_pct: number;
  ip_address: string;
  firmware_version: string;
}

export interface IoTReadingHistory {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  rain_detected: boolean;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface AIAnalysisResult {
  summary: string;
  thermal_analysis: string;
  wind_precip_insight: string;
  agricultural_and_lifestyle_precautions: string[];
  forecast_summary: string;
  generated_at: string;
  provider: 'gemini' | 'rule_engine';
  is_fallback?: boolean;
}

export interface CityInfo {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  isPopular?: boolean;
}
