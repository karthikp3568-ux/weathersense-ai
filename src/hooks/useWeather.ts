import { useState, useEffect, useCallback, useRef } from 'react';
import { WeatherData, ForecastData, TemperatureUnit, SpeedUnit, TimeFormat } from '../types/weather';
import { fetchCurrentWeather, fetchForecast } from '../services/weatherService';

export function useWeather() {
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('weathersense_city') || 'Bengaluru';
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Preference units
  const [tempUnit, setTempUnit] = useState<TemperatureUnit>(() => {
    return (localStorage.getItem('weathersense_temp_unit') as TemperatureUnit) || 'celsius';
  });

  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>(() => {
    return (localStorage.getItem('weathersense_speed_unit') as SpeedUnit) || 'kmh';
  });

  const [timeFormat, setTimeFormat] = useState<TimeFormat>(() => {
    return (localStorage.getItem('weathersense_time_format') as TimeFormat) || '12h';
  });

  // Favorite cities
  const [favoriteCities, setFavoriteCities] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('weathersense_favorites');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['Bengaluru', 'Mysuru', 'Hyderabad', 'Vijayapura'];
  });

  // Forced demo mode override toggle (if user wants to test demo mode explicitly)
  const [forceDemoMode, setForceDemoMode] = useState<boolean>(false);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('weathersense_city', selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    localStorage.setItem('weathersense_temp_unit', tempUnit);
  }, [tempUnit]);

  useEffect(() => {
    localStorage.setItem('weathersense_speed_unit', speedUnit);
  }, [speedUnit]);

  useEffect(() => {
    localStorage.setItem('weathersense_time_format', timeFormat);
  }, [timeFormat]);

  useEffect(() => {
    localStorage.setItem('weathersense_favorites', JSON.stringify(favoriteCities));
  }, [favoriteCities]);

  // Coordinates from browser geolocation, reused whenever that city is (re)loaded
  const geoCoordsRef = useRef<{ city: string; lat: number; lon: number } | null>(null);

  const loadCityData = useCallback(async (city: string, isRefresh = false, lat?: number, lon?: number) => {
    if (lat === undefined && lon === undefined && geoCoordsRef.current?.city === city) {
      lat = geoCoordsRef.current.lat;
      lon = geoCoordsRef.current.lon;
    }
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [weatherData, forecastData] = await Promise.all([
        fetchCurrentWeather(city, lat, lon),
        fetchForecast(city, lat, lon),
      ]);

      setWeather(weatherData);
      setForecast(forecastData);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(`Failed to retrieve meteorological telemetry: ${errMsg}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load and on city change
  useEffect(() => {
    loadCityData(selectedCity);
  }, [selectedCity, loadCityData]);

  // Periodic 5-minute background auto-refresh
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    refreshTimerRef.current = setInterval(() => {
      loadCityData(selectedCity, true);
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [selectedCity, loadCityData]);

  const refresh = useCallback(() => {
    loadCityData(selectedCity, true);
  }, [selectedCity, loadCityData]);

  const toggleFavorite = useCallback((city: string) => {
    setFavoriteCities(prev => {
      if (prev.includes(city)) {
        return prev.filter(c => c !== city);
      }
      return [...prev, city];
    });
  }, []);

  const isFavorite = useCallback(
    (city: string) => {
      return favoriteCities.includes(city);
    },
    [favoriteCities]
  );

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Browser geolocation is not supported in this environment.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode or fetch weather directly with coordinates
          const w = await fetchCurrentWeather('My Location', latitude, longitude);
          geoCoordsRef.current = { city: w.city, lat: latitude, lon: longitude };
          setSelectedCity(w.city);
          setWeather(w);
          const f = await fetchForecast(w.city, latitude, longitude);
          setForecast(f);
        } catch {
          setError('Unable to resolve coordinates to weather data.');
        } finally {
          setIsLoading(false);
        }
      },
      err => {
        setIsLoading(false);
        setError(`Geolocation permission denied or timed out (${err.message}). Using manual search.`);
      },
      { timeout: 10000 }
    );
  }, []);

  return {
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
    forceDemoMode,
    setForceDemoMode,
  };
}
