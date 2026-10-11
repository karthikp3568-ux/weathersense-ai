import { apiRequest } from './api';
import { WeatherData, ForecastData, TemperatureUnit, SpeedUnit, TimeFormat } from '../types/weather';
import { SAMPLE_CITY_WEATHER_MAP, SAMPLE_WEATHER_BENGALURU, SAMPLE_FORECAST_BENGALURU } from '../data/sampleData';

export async function fetchCurrentWeather(city: string, lat?: number, lon?: number): Promise<WeatherData> {
  try {
    let query = `city=${encodeURIComponent(city)}`;
    if (lat !== undefined && lon !== undefined) {
      query += `&lat=${lat}&lon=${lon}`;
    }
    const data = await apiRequest<WeatherData>(`/weather/current?${query}`);
    return data;
  } catch {
    console.warn(`[WeatherService] Backend unreachable, using verified demo dataset for ${city}`);
    const sample = SAMPLE_CITY_WEATHER_MAP[city] || {
      ...SAMPLE_WEATHER_BENGALURU,
      city,
      country: 'Demo Location',
    };
    return {
      ...sample,
      data_source: 'demo_sample',
      is_demo: true,
      last_updated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

export async function fetchForecast(city: string, lat?: number, lon?: number): Promise<ForecastData> {
  try {
    let query = `city=${encodeURIComponent(city)}`;
    if (lat !== undefined && lon !== undefined) {
      query += `&lat=${lat}&lon=${lon}`;
    }
    const data = await apiRequest<ForecastData>(`/weather/forecast?${query}`);
    return data;
  } catch {
    console.warn(`[WeatherService] Backend unreachable, using demo forecast for ${city}`);
    return {
      ...SAMPLE_FORECAST_BENGALURU,
      city,
      data_source: 'demo_sample',
      is_demo: true,
    };
  }
}

export async function compareCitiesData(city1: string, city2: string): Promise<WeatherData[]> {
  try {
    const res = await apiRequest<{ cities: WeatherData[] }>(`/weather/compare?cities=${encodeURIComponent(city1)},${encodeURIComponent(city2)}`);
    return res.cities;
  } catch {
    const w1 = SAMPLE_CITY_WEATHER_MAP[city1] || { ...SAMPLE_WEATHER_BENGALURU, city: city1 };
    const w2 = SAMPLE_CITY_WEATHER_MAP[city2] || { ...SAMPLE_WEATHER_BENGALURU, city: city2 };
    return [
      { ...w1, is_demo: true, data_source: 'demo_sample' },
      { ...w2, is_demo: true, data_source: 'demo_sample' },
    ];
  }
}

// Unit Conversion Helpers
export function celsiusToFahrenheit(c: number): number {
  return Math.round(((c * 9) / 5 + 32) * 10) / 10;
}

export function kmhToMs(kmh: number): number {
  return Math.round((kmh / 3.6) * 10) / 10;
}

export function formatTemperature(celsiusVal: number, unit: TemperatureUnit): string {
  if (celsiusVal === undefined || celsiusVal === null || isNaN(celsiusVal)) return 'Not available';
  if (unit === 'fahrenheit') {
    return `${celsiusToFahrenheit(celsiusVal)}°F`;
  }
  return `${Math.round(celsiusVal * 10) / 10}°C`;
}

export function formatSpeed(kmhVal: number, unit: SpeedUnit): string {
  if (kmhVal === undefined || kmhVal === null || isNaN(kmhVal)) return 'Not available';
  if (unit === 'ms') {
    return `${kmhToMs(kmhVal)} m/s`;
  }
  return `${Math.round(kmhVal * 10) / 10} km/h`;
}

export function formatTimeDisplay(timeStr: string, format: TimeFormat): string {
  if (!timeStr) return 'Not available';
  if (format === '24h') {
    // If it's "06:11 AM", convert to 24h
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      const parts = timeStr.trim().split(' ');
      const [hours, minutes] = parts[0].split(':').map(Number);
      const isPM = parts[1].toUpperCase() === 'PM';
      let h = hours;
      if (isPM && h !== 12) h += 12;
      if (!isPM && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    return timeStr;
  }
  return timeStr;
}
