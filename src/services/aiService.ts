import { apiRequest } from './api';
import { WeatherData, ForecastData, AIAnalysisResult } from '../types/weather';

export async function requestWeatherAnalysis(
  weather: WeatherData,
  forecast?: ForecastData,
  location?: string
): Promise<AIAnalysisResult> {
  try {
    const data = await apiRequest<AIAnalysisResult>('/ai/weather-analysis', {
      method: 'POST',
      body: JSON.stringify({
        weather,
        forecast,
        location: location || `${weather.city}, ${weather.country}`,
      }),
    });
    return data;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn('[AIService] Analysis endpoint unavailable, providing offline synthesis:', errMsg);
    return {
      summary: `Automated assessment for ${weather.city}: Current reading is ${weather.temperature}°C with ${weather.weather_description}. Atmospheric pressure is ${weather.pressure} hPa and humidity is ${weather.humidity}%.`,
      thermal_analysis: `Ambient temperature sits at ${weather.temperature}°C with an apparent heat index of ${weather.feels_like}°C. Moderate atmospheric moisture.`,
      wind_precip_insight: `Wind flow measured at ${weather.wind_speed} km/h. Precipitation is currently registered at ${weather.precipitation} mm.`,
      agricultural_and_lifestyle_precautions: [
        'Stay well-hydrated during peak outdoor activity hours.',
        'Carry an umbrella if local cloud cover exceeds 50%.',
        'Standard operational baseline for agricultural and drone operations.',
      ],
      forecast_summary: 'Expect diurnal cyclical temperature variations over the next 24 hours.',
      generated_at: new Date().toLocaleTimeString(),
      provider: 'rule_engine',
      is_fallback: true,
    };
  }
}

export async function sendChatMessage(
  message: string,
  currentWeather: WeatherData,
  city: string
): Promise<{ text: string; provider: 'gemini' | 'rule_engine'; is_fallback?: boolean; timestamp: string }> {
  try {
    const data = await apiRequest<{ text: string; provider: 'gemini' | 'rule_engine'; is_fallback?: boolean; timestamp: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        currentWeather,
        city,
      }),
    });
    return data;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn('[AIService] Chat endpoint error, providing contextual fallback:', errMsg);
    return {
      text: `WeatherSense AI Assistant (Offline/Demo Mode): Currently in ${city}, temperature is ${weatherFormat(currentWeather)}. To activate Gemini live conversational capabilities, ensure the backend server is running with GEMINI_API_KEY. (Notice: ${errMsg})`,
      provider: 'rule_engine',
      is_fallback: true,
      timestamp: new Date().toLocaleTimeString(),
    };
  }
}

function weatherFormat(w: WeatherData): string {
  return `${w.temperature}°C (${w.weather_description}), Humidity: ${w.humidity}%, Wind: ${w.wind_speed} km/h`;
}
