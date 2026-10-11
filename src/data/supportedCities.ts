import { CityInfo } from '../types/weather';

export const SUPPORTED_CITIES: CityInfo[] = [
  { name: 'Bengaluru', country: 'India', state: 'Karnataka', lat: 12.9716, lon: 77.5946, isPopular: true },
  { name: 'Mysuru', country: 'India', state: 'Karnataka', lat: 12.2958, lon: 76.6394, isPopular: true },
  { name: 'Vijayapura', country: 'India', state: 'Karnataka', lat: 16.8302, lon: 75.7100, isPopular: true },
  { name: 'Hyderabad', country: 'India', state: 'Telangana', lat: 17.3850, lon: 78.4867, isPopular: true },
  { name: 'Chennai', country: 'India', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, isPopular: true },
  { name: 'Mumbai', country: 'India', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, isPopular: true },
  { name: 'Delhi', country: 'India', state: 'Delhi', lat: 28.6139, lon: 77.2090, isPopular: true },
  { name: 'Pune', country: 'India', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, isPopular: true },
  { name: 'Kolkata', country: 'India', state: 'West Bengal', lat: 22.5726, lon: 88.3639, isPopular: false },
  { name: 'London', country: 'United Kingdom', state: 'England', lat: 51.5074, lon: -0.1278, isPopular: true },
  { name: 'New York', country: 'United States', state: 'NY', lat: 40.7128, lon: -74.0060, isPopular: true },
  { name: 'Tokyo', country: 'Japan', state: 'Kanto', lat: 35.6762, lon: 139.6503, isPopular: true },
  { name: 'Dubai', country: 'United Arab Emirates', state: 'Dubai', lat: 25.2048, lon: 55.2708, isPopular: true },
  { name: 'Singapore', country: 'Singapore', state: 'Singapore', lat: 1.3521, lon: 103.8198, isPopular: true },
  { name: 'Sydney', country: 'Australia', state: 'NSW', lat: -33.8688, lon: 151.2093, isPopular: false },
  { name: 'Paris', country: 'France', state: 'Île-de-France', lat: 48.8566, lon: 2.3522, isPopular: false },
];
