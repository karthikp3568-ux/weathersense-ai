import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { WeatherData, TemperatureUnit } from '../types/weather';
import { SUPPORTED_CITIES } from '../data/supportedCities';
import { SAMPLE_CITY_WEATHER_MAP } from '../data/sampleData';
import { formatTemperature } from '../services/weatherService';
import { Map as MapIcon, Layers, Navigation, ZoomIn, ZoomOut, Info } from 'lucide-react';

interface MapPageProps {
  weather: WeatherData | null;
  tempUnit: TemperatureUnit;
  onSelectCity: (cityName: string) => void;
}

export const MapPage: React.FC<MapPageProps> = ({ weather, tempUnit, onSelectCity }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapLayer, setMapLayer] = useState<'standard' | 'dark' | 'topo'>('dark');

  const currentLat = weather?.lat || 12.9716;
  const currentLon = weather?.lon || 77.5946;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent re-initialization error
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [currentLat, currentLon],
      zoom: 6,
      zoomControl: false,
    });
    mapInstanceRef.current = map;

    // Base TileLayer
    const tileUrl =
      mapLayer === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : mapLayer === 'topo'
        ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution =
      mapLayer === 'dark'
        ? '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    L.tileLayer(tileUrl, { attribution, maxZoom: 18 }).addTo(map);

    // Add city markers with custom DivIcons
    SUPPORTED_CITIES.forEach(city => {
      const cityWeather = SAMPLE_CITY_WEATHER_MAP[city.name];
      const temp = cityWeather ? cityWeather.temperature : 26;
      const isCurrent = weather?.city.toLowerCase() === city.name.toLowerCase();

      const customIcon = L.divIcon({
        className: 'custom-weather-pin',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
            background-color: ${isCurrent ? '#0284c7' : '#0f172a'};
            color: #ffffff;
            border: 2px solid ${isCurrent ? '#38bdf8' : '#334155'};
            padding: 4px 8px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            cursor: pointer;
            transform: translate(-50%, -50%);
          ">
            <span>${city.name}</span>
            <span style="color: #38bdf8; font-family: monospace;">${temp}°C</span>
          </div>
        `,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });

      const marker = L.marker([city.lat, city.lon], { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="color: #0f172a; font-family: system-ui, sans-serif; padding: 4px; min-width: 160px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 800;">${city.name}</h4>
          <p style="margin: 2px 0 6px 0; font-size: 11px; color: #64748b;">${city.country}</p>
          <div style="font-size: 18px; font-weight: 900; margin-bottom: 4px;">
            ${formatTemperature(temp, tempUnit)}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
            ${cityWeather?.weather_description || 'Clear sky'}
          </div>
          <button id="btn-select-${city.name.replace(/\s+/g, '')}" style="
            width: 100%;
            background-color: #0284c7;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
          ">
            Inspect Station
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-${city.name.replace(/\s+/g, '')}`);
        if (btn) {
          btn.onclick = () => {
            onSelectCity(city.name);
          };
        }
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapLayer, weather?.city, currentLat, currentLon, tempUnit, onSelectCity]);

  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentLat, currentLon], 8, { animate: true });
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Map Controls */}
      <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <MapIcon className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Interactive Regional Weather Station Map
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            OpenStreetMap geospatial projection with live telemetry markers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Map Layer Switcher */}
          <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-0.5 text-xs font-semibold">
            <button
              onClick={() => setMapLayer('dark')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mapLayer === 'dark' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark Radar
            </button>
            <button
              onClick={() => setMapLayer('standard')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mapLayer === 'standard' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Street Map
            </button>
            <button
              onClick={() => setMapLayer('topo')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mapLayer === 'topo' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Topography
            </button>
          </div>

          <button
            onClick={handleResetCenter}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Recenter on current city"
          >
            <Navigation className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[clamp(20rem,65dvh,40rem)] w-full rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950">
        <div ref={mapContainerRef} className="h-full w-full z-10" />

        {/* Floating Zoom & Action Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 shadow-lg">
          <button
            onClick={handleZoomIn}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 backdrop-blur-md cursor-pointer transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 backdrop-blur-md cursor-pointer transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetCenter}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-slate-700 backdrop-blur-md cursor-pointer transition-colors"
            title="Recenter Map"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>

        {/* Attribution Bar */}
        <div className="absolute bottom-2 left-2 z-20 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 text-micro text-slate-400">
          OpenStreetMap &bull; Leaflet &bull; WeatherSense Geospatial Mesh
        </div>
      </div>
    </div>
  );
};
