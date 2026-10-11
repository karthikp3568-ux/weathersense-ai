import React, { useState, useMemo } from 'react';
import { Search, MapPin, Star, X, Compass, Check } from 'lucide-react';
import { SUPPORTED_CITIES } from '../../data/supportedCities';
import { CityInfo } from '../../types/weather';

interface CitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (cityName: string) => void;
  currentCity: string;
  favoriteCities: string[];
  onToggleFavorite: (city: string) => void;
  onRequestGeolocation: () => void;
}

export const CitySearchModal: React.FC<CitySearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  currentCity,
  favoriteCities,
  onToggleFavorite,
  onRequestGeolocation,
}) => {
  const [query, setQuery] = useState('');

  const filteredCities = useMemo(() => {
    if (!query.trim()) {
      return SUPPORTED_CITIES;
    }
    const q = query.toLowerCase().trim();
    return SUPPORTED_CITIES.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        (c.state && c.state.toLowerCase().includes(q))
    );
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (cityName: string) => {
    onSelectCity(cityName);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSelectCity(query.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85dvh]">
        {/* Header Search Input */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-sky-400 shrink-0" />
          <form onSubmit={handleCustomSubmit} className="flex-1">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search city (e.g. Bengaluru, Mysuru, London, Tokyo)..."
              className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
            />
          </form>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action button: Geolocation */}
        <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onRequestGeolocation();
              onClose();
            }}
            className="inline-flex items-center gap-2 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors cursor-pointer py-1"
          >
            <Compass className="w-4 h-4" />
            <span>Use My Exact Location (GPS)</span>
          </button>
          <span className="text-tiny text-slate-400">Supports global coordinates</span>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {/* Favorites */}
          {favoriteCities.length > 0 && !query && (
            <div>
              <h5 className="text-tiny font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Saved Favorite Locations</span>
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {favoriteCities.map(fav => (
                  <div
                    key={fav}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      currentCity.toLowerCase() === fav.toLowerCase()
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                    }`}
                  >
                    <button
                      onClick={() => handleSelect(fav)}
                      className="flex-1 text-left truncate flex items-center gap-1.5 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="truncate">{fav}</span>
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onToggleFavorite(fav);
                      }}
                      className="p-1 text-amber-400 hover:text-slate-400 cursor-pointer"
                      title="Remove favorite"
                    >
                      <Star className="w-3 h-3 fill-amber-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick city suggestions */}
          <div>
            <h5 className="text-tiny font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {query ? 'Matching Cities' : 'Available Meteorological Stations & Cities'}
            </h5>
            <div className="space-y-1.5">
              {filteredCities.map((city: CityInfo) => {
                const isSelected = currentCity.toLowerCase() === city.name.toLowerCase();
                const isFav = favoriteCities.includes(city.name);

                return (
                  <div
                    key={`${city.name}-${city.country}`}
                    onClick={() => handleSelect(city.name)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500/40 text-white'
                        : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-700/40 text-sky-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{city.name}</span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-micro px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-medium border border-sky-500/30">
                              <Check className="w-2.5 h-2.5" /> Selected
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {city.state ? `${city.state}, ` : ''}{city.country} • Lat {city.lat.toFixed(2)}, Lon {city.lon.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onToggleFavorite(city.name);
                      }}
                      className="p-2 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                      title={isFav ? 'Remove favorite' : 'Add to favorites'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'text-amber-400 fill-amber-400' : ''}`} />
                    </button>
                  </div>
                );
              })}

              {filteredCities.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <p>No exact match in indexed list.</p>
                  <button
                    onClick={() => handleSelect(query.trim())}
                    className="mt-2 text-sky-400 hover:underline font-medium cursor-pointer"
                  >
                    Search global live coordinates for &quot;{query.trim()}&quot; &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
