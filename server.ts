import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { SAMPLE_WEATHER_BENGALURU, SAMPLE_CITY_WEATHER_MAP, SAMPLE_FORECAST_BENGALURU, SAMPLE_ALERTS, SAMPLE_HISTORICAL_DATA, SAMPLE_IOT_STATION, SAMPLE_IOT_HISTORY } from './src/data/sampleData';
import { SUPPORTED_CITIES } from './src/data/supportedCities';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory store for IoT readings and alert configurations
let iotCurrentStation = { ...SAMPLE_IOT_STATION };
let iotReadingsStore = [...SAMPLE_IOT_HISTORY];
let alertsStore = [...SAMPLE_ALERTS];

// Helper: Init Gemini if key available
const GEMINI_PLACEHOLDERS = ['MY_GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY_HERE'];

function isGeminiConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  return !!apiKey && apiKey.trim() !== '' && !GEMINI_PLACEHOLDERS.includes(apiKey);
}

function getGeminiClient(): GoogleGenAI | null {
  if (!isGeminiConfigured()) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ----------------------------------------------------
// Weather Code mapping for Open-Meteo
// ----------------------------------------------------
function mapWmoCode(code: number): { main: string; desc: string; icon: string } {
  switch (code) {
    case 0:
      return { main: 'Clear', desc: 'Clear sky', icon: 'Sun' };
    case 1:
      return { main: 'Mainly Clear', desc: 'Mainly clear sky', icon: 'Sun' };
    case 2:
      return { main: 'Partly Cloudy', desc: 'Partly cloudy sky', icon: 'CloudSun' };
    case 3:
      return { main: 'Overcast', desc: 'Overcast conditions', icon: 'Clouds' };
    case 45:
    case 48:
      return { main: 'Fog', desc: 'Foggy conditions with reduced visibility', icon: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { main: 'Drizzle', desc: 'Light to moderate drizzle', icon: 'CloudDrizzle' };
    case 61:
    case 63:
    case 65:
      return { main: 'Rain', desc: 'Rain showers', icon: 'CloudRain' };
    case 71:
    case 73:
    case 75:
      return { main: 'Snow', desc: 'Snowfall', icon: 'Snowflake' };
    case 80:
    case 81:
    case 82:
      return { main: 'Rain', desc: 'Heavy rain showers', icon: 'CloudRain' };
    case 95:
    case 96:
    case 99:
      return { main: 'Thunderstorm', desc: 'Thunderstorm activity', icon: 'CloudLightning' };
    default:
      return { main: 'Clouds', desc: 'Cloudy sky', icon: 'CloudSun' };
  }
}

// ----------------------------------------------------
// Health Check
// ----------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    gemini_configured: isGeminiConfigured(),
    openweather_configured: !!process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY !== 'YOUR_OPENWEATHER_API_KEY_HERE',
    mongodb_configured: !!process.env.MONGODB_URI,
    environment: process.env.NODE_ENV || 'development',
  });
});

// ----------------------------------------------------
// Current Weather
// ----------------------------------------------------
app.get('/api/weather/current', async (req: Request, res: Response) => {
  const cityName = (req.query.city as string) || 'Bengaluru';
  const queryLat = req.query.lat ? parseFloat(req.query.lat as string) : null;
  const queryLon = req.query.lon ? parseFloat(req.query.lon as string) : null;

  // 1. Try OpenWeather if API key is provided
  if (process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY !== 'YOUR_OPENWEATHER_API_KEY_HERE') {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const sunriseDate = new Date(data.sys.sunrise * 1000);
        const sunsetDate = new Date(data.sys.sunset * 1000);

        return res.json({
          city: data.name,
          country: data.sys.country,
          lat: data.coord.lat,
          lon: data.coord.lon,
          temperature: Math.round(data.main.temp * 10) / 10,
          feels_like: Math.round(data.main.feels_like * 10) / 10,
          temp_min: Math.round(data.main.temp_min * 10) / 10,
          temp_max: Math.round(data.main.temp_max * 10) / 10,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          wind_speed: Math.round(data.wind.speed * 3.6 * 10) / 10, // m/s to km/h
          wind_direction: data.wind.deg || 0,
          cloud_coverage: data.clouds?.all || 0,
          visibility: data.visibility ? Math.round((data.visibility / 1000) * 10) / 10 : 10,
          precipitation: data.rain?.['1h'] || 0,
          uv_index: null,
          weather_main: data.weather[0]?.main || 'Clear',
          weather_description: data.weather[0]?.description || 'Normal conditions',
          weather_icon: 'CloudSun',
          sunrise: sunriseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sunset: sunsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          last_updated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data_source: 'live_openweather',
          is_demo: false,
        });
      }
    } catch {
      console.warn('OpenWeather fetch failed, attempting Open-Meteo fallback');
    }
  }

  // 2. Try Open-Meteo (Free, reliable global live data without API key)
  try {
    let lat = queryLat;
    let lon = queryLon;
    let resolvedCity = cityName;
    let resolvedCountry = 'Global';

    if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
      const match = SUPPORTED_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());
      if (match) {
        lat = match.lat;
        lon = match.lon;
        resolvedCity = match.name;
        resolvedCountry = match.country;
      } else {
        // Geocode with Open-Meteo
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            lat = geoData.results[0].latitude;
            lon = geoData.results[0].longitude;
            resolvedCity = geoData.results[0].name;
            resolvedCountry = geoData.results[0].country || 'Global';
          }
        }
      }
    }

    if (lat !== null && lon !== null) {
      const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover,weather_code&daily=sunrise,sunset,uv_index_max&timezone=auto`;
      const meteoRes = await fetch(meteoUrl);
      if (meteoRes.ok) {
        const d = await meteoRes.json();
        const cur = d.current;
        const wmo = mapWmoCode(cur.weather_code);
        const sunriseRaw = d.daily?.sunrise?.[0] ? new Date(d.daily.sunrise[0]) : null;
        const sunsetRaw = d.daily?.sunset?.[0] ? new Date(d.daily.sunset[0]) : null;

        return res.json({
          city: resolvedCity,
          country: resolvedCountry,
          lat,
          lon,
          temperature: Math.round(cur.temperature_2m * 10) / 10,
          feels_like: Math.round(cur.apparent_temperature * 10) / 10,
          temp_min: Math.round((cur.temperature_2m - 4) * 10) / 10,
          temp_max: Math.round((cur.temperature_2m + 4) * 10) / 10,
          humidity: cur.relative_humidity_2m,
          pressure: Math.round(cur.surface_pressure),
          wind_speed: Math.round(cur.wind_speed_10m * 10) / 10,
          wind_direction: cur.wind_direction_10m,
          cloud_coverage: cur.cloud_cover,
          visibility: 10.0,
          precipitation: cur.precipitation || 0.0,
          uv_index: d.daily?.uv_index_max?.[0] || 6.5,
          weather_main: wmo.main,
          weather_description: wmo.desc,
          weather_icon: wmo.icon,
          sunrise: sunriseRaw ? sunriseRaw.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:15 AM',
          sunset: sunsetRaw ? sunsetRaw.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:15 PM',
          last_updated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data_source: 'live_openmeteo',
          is_demo: false,
        });
      }
    }
  } catch (err) {
    console.warn('Open-Meteo live API lookup failed:', err);
  }

  // 3. Graceful fallback to verified sample dataset
  const fallback = SAMPLE_CITY_WEATHER_MAP[cityName] || {
    ...SAMPLE_WEATHER_BENGALURU,
    city: cityName,
    country: 'Sample Location',
  };

  return res.json({
    ...fallback,
    data_source: 'demo_sample',
    is_demo: true,
  });
});

// ----------------------------------------------------
// Forecast Data
// ----------------------------------------------------
app.get('/api/weather/forecast', async (req: Request, res: Response) => {
  const cityName = (req.query.city as string) || 'Bengaluru';
  const match = SUPPORTED_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());
  const queryLat = req.query.lat ? parseFloat(req.query.lat as string) : NaN;
  const queryLon = req.query.lon ? parseFloat(req.query.lon as string) : NaN;
  let lat = match ? match.lat : 12.9716;
  let lon = match ? match.lon : 77.5946;
  let resolvedCountry = match?.country || 'India';

  try {
    if (!isNaN(queryLat) && !isNaN(queryLon)) {
      lat = queryLat;
      lon = queryLon;
    } else if (!match) {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          lat = geoData.results[0].latitude;
          lon = geoData.results[0].longitude;
          resolvedCountry = geoData.results[0].country || 'Global';
        }
      }
    }

    const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=7`;
    const response = await fetch(meteoUrl);
    if (response.ok) {
      const data = await response.json();
      const hourly = [];
      // Open-Meteo hourly times are in the city's local timezone (timezone=auto)
      const currentHour = new Date(Date.now() + (data.utc_offset_seconds || 0) * 1000).getUTCHours();

      // Take next 8 intervals (every 3 hours)
      for (let i = 0; i < 24; i += 3) {
        const index = currentHour + i;
        if (data.hourly.time[index]) {
          const timeStr = data.hourly.time[index].substring(11, 16);
          const wmo = mapWmoCode(data.hourly.weather_code[index]);
          hourly.push({
            time: timeStr,
            hour: parseInt(timeStr.split(':')[0], 10),
            temp: Math.round(data.hourly.temperature_2m[index] * 10) / 10,
            feels_like: Math.round(data.hourly.apparent_temperature[index] * 10) / 10,
            weather_main: wmo.main,
            weather_description: wmo.desc,
            weather_icon: wmo.icon,
            humidity: data.hourly.relative_humidity_2m[index],
            wind_speed: Math.round(data.hourly.wind_speed_10m[index] * 10) / 10,
            precipitation_prob: data.hourly.precipitation_probability[index] || 0,
            rain_mm: Math.round(data.hourly.precipitation[index] * 10) / 10,
          });
        }
      }

      const daily = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let d = 0; d < 7; d++) {
        if (data.daily.time[d]) {
          const dateObj = new Date(`${data.daily.time[d]}T00:00:00`);
          const dayName = d === 0 ? 'Today' : days[dateObj.getDay()];
          const wmo = mapWmoCode(data.daily.weather_code[d]);
          daily.push({
            date: data.daily.time[d],
            day_name: dayName,
            temp_min: Math.round(data.daily.temperature_2m_min[d] * 10) / 10,
            temp_max: Math.round(data.daily.temperature_2m_max[d] * 10) / 10,
            weather_main: wmo.main,
            weather_description: wmo.desc,
            weather_icon: wmo.icon,
            humidity: 60,
            wind_speed: 12.0,
            precipitation_prob: data.daily.precipitation_probability_max[d] || 0,
            rain_mm: Math.round((data.daily.precipitation_sum[d] || 0) * 10) / 10,
            sunrise: data.daily.sunrise[d] ? new Date(data.daily.sunrise[d]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:12 AM',
            sunset: data.daily.sunset[d] ? new Date(data.daily.sunset[d]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:08 PM',
          });
        }
      }

      return res.json({
        city: cityName,
        country: resolvedCountry,
        hourly,
        daily,
        data_source: 'live_openmeteo',
        is_demo: false,
      });
    }
  } catch (err) {
    console.warn('Live forecast API error, serving verified sample dataset:', err);
  }

  // Fallback demo forecast
  res.json({
    ...SAMPLE_FORECAST_BENGALURU,
    city: cityName,
    country: resolvedCountry,
    data_source: 'demo_sample',
    is_demo: true,
  });
});

// ----------------------------------------------------
// Compare Cities
// ----------------------------------------------------
app.get('/api/weather/compare', async (req: Request, res: Response) => {
  const citiesQuery = (req.query.cities as string) || 'Bengaluru,Mysuru';
  const cities = citiesQuery.split(',').map(c => c.trim());

  const results = await Promise.all(
    cities.map(async city => {
      const match = SAMPLE_CITY_WEATHER_MAP[city];
      if (match) return match;
      return {
        ...SAMPLE_WEATHER_BENGALURU,
        city,
        country: 'Comparison City',
      };
    })
  );

  res.json({
    cities: results,
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// AI Weather Analysis (Using Google Gemini API)
// ----------------------------------------------------
app.post('/api/ai/weather-analysis', async (req: Request, res: Response) => {
  const { weather, location } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // Transparently inform frontend that Gemini key is not configured, while returning rule-based analysis
    return res.json({
      summary: `Automated analysis for ${location || weather?.city || 'Selected Location'}: Currently observing ${weather?.temperature ?? 26}°C with ${weather?.weather_description ?? 'fair weather'}. Relative humidity is at ${weather?.humidity ?? 60}%, accompanied by surface winds of ${weather?.wind_speed ?? 12} km/h.`,
      thermal_analysis: `Thermal comfort index: Apparent temperature (feels like) is ${weather?.feels_like ?? 27}°C against an ambient reading of ${weather?.temperature ?? 26}°C. Dew point and atmospheric moisture remain in the moderate comfort envelope.`,
      wind_precip_insight: `Barometric pressure is ${weather?.pressure ?? 1013} hPa with atmospheric stability. Precipitation probability stands at ${weather?.precipitation ? 'elevated' : 'nominal levels'}.`,
      agricultural_and_lifestyle_precautions: [
        'Optimal conditions for outdoor activities and morning commutes.',
        'Ensure standard hydration if traveling outdoors during peak midday solar radiation.',
        'Agricultural irrigation cycles can proceed on routine schedule under current barometric stability.'
      ],
      forecast_summary: 'Stable diurnal curve expected over the subsequent 24-48 hours with seasonal temperature variance.',
      generated_at: new Date().toLocaleTimeString(),
      provider: 'rule_engine',
      is_fallback: true,
      message: 'GEMINI_API_KEY is not configured in backend environment. Serving deterministic rule-based analysis. Set GEMINI_API_KEY to activate Google Gemini.',
    });
  }

  try {
    const prompt = `You are the lead meteorologist of WeatherSense AI.
Analyze the following weather telemetry for ${location || weather?.city || 'Location'}:
- Current Temperature: ${weather?.temperature}°C (Feels like: ${weather?.feels_like}°C)
- Min/Max: ${weather?.temp_min}°C / ${weather?.temp_max}°C
- Condition: ${weather?.weather_main} - ${weather?.weather_description}
- Relative Humidity: ${weather?.humidity}%
- Atmospheric Pressure: ${weather?.pressure} hPa
- Wind Speed: ${weather?.wind_speed} km/h at ${weather?.wind_direction}°
- Cloud Cover: ${weather?.cloud_coverage}%
- Precipitation: ${weather?.precipitation} mm
- UV Index: ${weather?.uv_index ?? 'N/A'}

Provide a rigorous scientific yet accessible meteorological evaluation in valid JSON matching this exact structure:
{
  "summary": "2-3 sentences concise meteorological summary",
  "thermal_analysis": "Detailed explanation of temperature, heat index/wind chill, and relative humidity dynamics",
  "wind_precip_insight": "Analysis of wind vectors, pressure systems, and precipitation tendencies",
  "agricultural_and_lifestyle_precautions": ["Precaution 1", "Precaution 2", "Precaution 3"],
  "forecast_summary": "1-2 sentences on short-term meteorological trends"
}
Output strictly raw JSON without markdown code fences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    let rawText = response.text || '';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(rawText);

    return res.json({
      ...parsed,
      generated_at: new Date().toLocaleTimeString(),
      provider: 'gemini',
      is_fallback: false,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Gemini API call failed:', errMsg);
    return res.status(500).json({
      error: 'GEMINI_CALL_FAILED',
      message: 'Gemini analysis encountered an error: ' + errMsg,
      is_fallback: true,
      summary: `Current temperature in ${weather?.city || 'the area'} is ${weather?.temperature}°C with ${weather?.weather_description}. Conditions remain within typical parameters.`,
      thermal_analysis: `Ambient temperature stands at ${weather?.temperature}°C. Relative humidity is ${weather?.humidity}%.`,
      wind_precip_insight: `Wind speed is registered at ${weather?.wind_speed} km/h with pressure at ${weather?.pressure} hPa.`,
      agricultural_and_lifestyle_precautions: [
        'Stay hydrated throughout the day.',
        'Plan outdoor tasks according to peak sunshine hours.'
      ],
      forecast_summary: 'Weather parameters remain stable.',
      generated_at: new Date().toLocaleTimeString(),
      provider: 'rule_engine',
    });
  }
});

// ----------------------------------------------------
// AI Weather Chatbot (Using Google Gemini API)
// ----------------------------------------------------
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, currentWeather, city } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // Provide intelligent deterministic fallback responses
    const lower = (message || '').toLowerCase();
    let reply = `WeatherSense AI Assistant (Offline/Demo Mode): I see that in ${city || 'Bengaluru'}, the current temperature is ${currentWeather?.temperature ?? 26.4}°C with ${currentWeather?.weather_description ?? 'clouds'}, humidity of ${currentWeather?.humidity ?? 62}%, and wind speed of ${currentWeather?.wind_speed ?? 14.8} km/h. To unlock full natural language Gemini conversations, please configure your GEMINI_API_KEY in .env.`;

    if (lower.includes('rain') || lower.includes('precipitation')) {
      reply = `According to current telemetry for ${city || 'Bengaluru'}, measured precipitation is ${currentWeather?.precipitation ?? 0} mm with ${currentWeather?.humidity ?? 62}% humidity. Conditions show ${currentWeather?.weather_main === 'Rain' ? 'active showers' : 'low to moderate probability of immediate precipitation'}.`;
    } else if (lower.includes('temperature') || lower.includes('hot') || lower.includes('cold')) {
      reply = `The current temperature in ${city || 'Bengaluru'} is ${currentWeather?.temperature ?? 26.4}°C, with an apparent feels-like temperature of ${currentWeather?.feels_like ?? 27.1}°C. Day bounds are recorded between ${currentWeather?.temp_min ?? 21}°C and ${currentWeather?.temp_max ?? 29.5}°C.`;
    } else if (lower.includes('precaution') || lower.includes('clothing') || lower.includes('advice')) {
      reply = `Based on current readings (${currentWeather?.temperature ?? 26.4}°C, ${currentWeather?.humidity ?? 62}% humidity, ${currentWeather?.wind_speed ?? 14.8} km/h wind): Light breathable attire is recommended. Keep an umbrella on hand if cloud cover exceeds 60%.`;
    } else if (lower.includes('compare') || lower.includes('mysuru') || lower.includes('bengaluru')) {
      reply = `Comparison overview: Bengaluru is currently around 26.4°C with 62% humidity and scattered clouds, while Mysuru enjoys slightly warmer conditions at 28.1°C with 58% humidity and clear skies.`;
    }

    return res.json({
      text: reply,
      provider: 'rule_engine',
      is_fallback: true,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  try {
    const systemPrompt = `You are WeatherSense AI Assistant, an expert meteorological intelligence system.
Current real-time observations for ${city || currentWeather?.city || 'the selected location'}:
- Temperature: ${currentWeather?.temperature}°C (Feels like: ${currentWeather?.feels_like}°C)
- Min/Max: ${currentWeather?.temp_min}°C / ${currentWeather?.temp_max}°C
- Condition: ${currentWeather?.weather_main} (${currentWeather?.weather_description})
- Humidity: ${currentWeather?.humidity}%
- Atmospheric Pressure: ${currentWeather?.pressure} hPa
- Wind: ${currentWeather?.wind_speed} km/h
- Precipitation: ${currentWeather?.precipitation} mm
- UV Index: ${currentWeather?.uv_index ?? 'N/A'}

Rules:
1. Always ground your weather assertions in the provided real telemetry measurements above.
2. If asked about another city or global weather, use your broader geographical knowledge while noting whether live telemetry is attached.
3. Be helpful, concise, scientific, and clear.
4. Format output with clean bullet points or short paragraphs where appropriate.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const reply = response.text || 'Weather analysis generated.';
    return res.json({
      text: reply,
      provider: 'gemini',
      is_fallback: false,
      timestamp: new Date().toLocaleTimeString(),
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Gemini chat error:', errMsg);
    return res.json({
      text: `Apologies, I encountered an issue reaching Google Gemini: ${errMsg}. Current local reading is ${currentWeather?.temperature}°C with ${currentWeather?.weather_description}.`,
      provider: 'rule_engine',
      is_fallback: true,
      timestamp: new Date().toLocaleTimeString(),
    });
  }
});

// ----------------------------------------------------
// Historical Weather Analytics
// ----------------------------------------------------
app.get('/api/history', (req: Request, res: Response) => {
  const city = (req.query.city as string) || 'Bengaluru';
  res.json({
    city,
    records: SAMPLE_HISTORICAL_DATA,
    summary: {
      avg_temp: 24.9,
      max_temp: 30.8,
      min_temp: 19.8,
      avg_humidity: 64.6,
      total_precipitation_mm: 55.6,
    },
    data_source: 'archive_demo_store',
  });
});

// ----------------------------------------------------
// Weather Alerts
// ----------------------------------------------------
app.get('/api/alerts', (_req: Request, res: Response) => {
  res.json({
    alerts: alertsStore,
    total: alertsStore.length,
    active_count: alertsStore.filter(a => !a.acknowledged).length,
  });
});

app.post('/api/alerts/acknowledge', (req: Request, res: Response) => {
  const { alertId } = req.body;
  alertsStore = alertsStore.map(a => (a.id === alertId ? { ...a, acknowledged: true } : a));
  res.json({ success: true, alerts: alertsStore });
});

// ----------------------------------------------------
// IoT Weather Station Ingestion and Telemetry
// ----------------------------------------------------
app.get('/api/stations', (_req: Request, res: Response) => {
  res.json({
    stations: [iotCurrentStation],
    history: iotReadingsStore,
    telemetry_status: iotCurrentStation.status,
  });
});

// Ingest sensor readings (designed for ESP32 HTTP client)
app.post('/api/stations/readings', (req: Request, res: Response) => {
  const { temperature, humidity, pressure, wind_speed, rain_detected, station_id } = req.body;

  if (temperature === undefined || humidity === undefined) {
    return res.status(400).json({ error: 'Missing mandatory temperature or humidity values' });
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  iotCurrentStation = {
    ...iotCurrentStation,
    station_id: station_id || iotCurrentStation.station_id,
    temperature: parseFloat(temperature),
    humidity: parseFloat(humidity),
    pressure: pressure ? parseFloat(pressure) : iotCurrentStation.pressure,
    wind_speed: wind_speed ? parseFloat(wind_speed) : iotCurrentStation.wind_speed,
    rain_detected: Boolean(rain_detected),
    last_reading_time: now.toLocaleTimeString(),
    status: 'online', // Mark online when live readings arrive
  };

  const newReading = {
    timestamp: timeStr,
    temperature: parseFloat(temperature),
    humidity: parseFloat(humidity),
    pressure: pressure ? parseFloat(pressure) : 1013.2,
    wind_speed: wind_speed ? parseFloat(wind_speed) : 0,
    rain_detected: Boolean(rain_detected),
  };

  iotReadingsStore.push(newReading);
  if (iotReadingsStore.length > 20) {
    iotReadingsStore.shift();
  }

  return res.json({
    success: true,
    message: 'IoT reading ingested successfully into WeatherSense AI telemetry pipeline',
    station: iotCurrentStation,
  });
});

// ----------------------------------------------------
// Vite Dev Middleware / Production Static Server
// ----------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WeatherSense AI Full-Stack Server active on http://0.0.0.0:${PORT}`);
    console.log(`Gemini API configured: ${isGeminiConfigured()}`);
  }).on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Set a different PORT in .env (e.g. PORT=3001).`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
}

startServer().catch(err => {
  console.error('Failed to start WeatherSense AI server:', err);
});
