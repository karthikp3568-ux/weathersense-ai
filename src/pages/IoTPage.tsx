import React, { useState, useEffect } from 'react';
import { IoTStationData, IoTReadingHistory, TemperatureUnit } from '../types/weather';
import { fetchStationData, postSensorReading } from '../services/iotService';
import { formatTemperature } from '../services/weatherService';
import {
  Cpu,
  Wifi,
  WifiOff,
  Activity,
  Thermometer,
  Droplets,
  Gauge,
  CloudRain,
  Wind,
  Battery,
  Code,
  Copy,
  Check,
  Send,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface IoTPageProps {
  tempUnit: TemperatureUnit;
}

export const IoTPage: React.FC<IoTPageProps> = ({ tempUnit }) => {
  const [station, setStation] = useState<IoTStationData | null>(null);
  const [history, setHistory] = useState<IoTReadingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Simulation form state
  const [simTemp, setSimTemp] = useState('27.4');
  const [simHum, setSimHum] = useState('63.0');
  const [simPres, setSimPres] = useState('1013.8');
  const [simWind, setSimWind] = useState('14.2');
  const [simRain, setSimRain] = useState(false);
  const [simStatusMsg, setSimStatusMsg] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchStationData();
    if (data.stations && data.stations.length > 0) {
      setStation(data.stations[0]);
    }
    setHistory(data.history || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s poll
    return () => clearInterval(interval);
  }, []);

  const handleSendSimulatedReading = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimStatusMsg('Transmitting HTTP POST packet to /api/stations/readings...');
    const res = await postSensorReading({
      temperature: parseFloat(simTemp),
      humidity: parseFloat(simHum),
      pressure: parseFloat(simPres),
      wind_speed: parseFloat(simWind),
      rain_detected: simRain,
      station_id: station?.station_id || 'ESP32-WS-NODE-01',
    });

    if (res.success) {
      setSimStatusMsg('Telemetry packet ingested successfully! Live sensor status updated.');
      loadData();
    } else {
      setSimStatusMsg(`Transmission error: ${res.message}`);
    }
    setTimeout(() => setSimStatusMsg(null), 5000);
  };

  const esp32CodeSnippet = `// WeatherSense AI — Physical ESP32 Hardware Integration Firmware
// Compatible: ESP32 + DHT22 (GPIO 4) + BMP280 (I2C) + Rain Sensor (GPIO 34)

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://YOUR_SERVER_IP:3000/api/stations/readings";

#define DHTPIN 4
#define DHTTYPE DHT22
#define RAIN_PIN 34

DHT dht(DHTPIN, DHTTYPE);
Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\\nWiFi Connected. IP: " + WiFi.localIP().toString());
  
  dht.begin();
  bmp.begin(0x76);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    float pres = bmp.readPressure() / 100.0F; // hPa
    bool rain = (analogRead(RAIN_PIN) < 2000);

    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\\"station_id\\":\\"ESP32-NODE-01\\",\\"temperature\\":" + String(temp, 1) + 
                     ",\\"humidity\\":" + String(hum, 1) + 
                     ",\\"pressure\\":" + String(pres, 1) + 
                     ",\\"rain_detected\\":" + (rain ? "true" : "false") + "}";

    int httpCode = http.POST(payload);
    Serial.printf("[HTTP] Ingestion response code: %d\\n", httpCode);
    http.end();
  }
  delay(60000); // 60-second telemetry beacon
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(esp32CodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Cpu className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              IoT Microcontroller &amp; Weather Station Telemetry
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Physical edge telemetry pipeline designed for ESP32, DHT22, BMP280 &amp; tipping rain sensors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border flex items-center gap-2 ${
              station?.status === 'online'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                station?.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>
              {station?.status === 'online' ? 'NODE CONNECTED (LIVE HTTP FEED)' : 'DEMO MODE — NO PHYSICAL SENSOR CONNECTED'}
            </span>
          </span>
        </div>
      </div>

      {/* Sensor Metrics Overview Cards */}
      {station && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Temp */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>DHT22 Temp</span>
            </div>
            <span className="text-2xl font-bold font-mono text-white">
              {formatTemperature(station.temperature, tempUnit)}
            </span>
            <span className="text-micro text-slate-400 block mt-1">Calibrated ±0.5°C</span>
          </div>

          {/* 2. Humidity */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>DHT22 Humidity</span>
            </div>
            <span className="text-2xl font-bold font-mono text-white">{station.humidity}%</span>
            <span className="text-micro text-slate-400 block mt-1">Relative moisture</span>
          </div>

          {/* 3. Pressure */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              <span>BMP280 Baro</span>
            </div>
            <span className="text-2xl font-bold font-mono text-white">{station.pressure}</span>
            <span className="text-micro text-slate-400 block mt-1">hPa sea-level</span>
          </div>

          {/* 4. Rain Sensor */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span>Optical Rain</span>
            </div>
            <span className={`text-xl font-bold block mt-1 ${station.rain_detected ? 'text-blue-400' : 'text-slate-400'}`}>
              {station.rain_detected ? 'Active Moisture' : 'Dry Surface'}
            </span>
            <span className="text-micro text-slate-400 block mt-1">Resistive sensor</span>
          </div>

          {/* 5. Wind Speed */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Wind className="w-3.5 h-3.5 text-sky-400" />
              <span>Anemometer</span>
            </div>
            <span className="text-2xl font-bold font-mono text-white">{station.wind_speed}</span>
            <span className="text-micro text-slate-400 block mt-1">km/h pulse count</span>
          </div>

          {/* 6. Battery & Node Health */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>Node Power</span>
            </div>
            <span className="text-2xl font-bold font-mono text-emerald-400">{station.battery_pct}%</span>
            <span className="text-micro text-slate-400 block mt-1">Solar LiPo 3.7V</span>
          </div>
        </div>
      )}

      {/* Device Info & Live Telemetry Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hardware Status Card */}
        <div className="lg:col-span-5 bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Hardware Specification &amp; Port</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Node ID: {station?.station_id}</span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-700/30">
              <span className="text-slate-400">Device Model:</span>
              <span className="font-semibold text-white">Espressif ESP32-WROOM-32 (38-pin)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/30">
              <span className="text-slate-400">Firmware Build:</span>
              <span className="font-mono text-slate-300">{station?.firmware_version}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/30">
              <span className="text-slate-400">Physical Deployment:</span>
              <span className="text-white">{station?.location}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/30">
              <span className="text-slate-400">IP / Network Route:</span>
              <span className="font-mono text-sky-400">{station?.ip_address}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Last Telemetry Packet:</span>
              <span className="font-mono text-white">{station?.last_reading_time}</span>
            </div>
          </div>

          {/* Interactive Test Packet Simulator */}
          <div className="pt-4 border-t border-slate-700/50">
            <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Simulate Physical Sensor Packet (Test Endpoint)</span>
            </h4>
            <p className="text-tiny text-slate-400 mb-3">
              Sends a real POST request to <code className="text-sky-300 bg-slate-900 px-1 py-0.5 rounded">/api/stations/readings</code>.
            </p>

            <form onSubmit={handleSendSimulatedReading} className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-micro text-slate-400 block mb-0.5">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simTemp}
                    onChange={e => setSimTemp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-micro text-slate-400 block mb-0.5">Humidity (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={simHum}
                    onChange={e => setSimHum(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-micro text-slate-400 block mb-0.5">Pressure (hPa)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={simPres}
                    onChange={e => setSimPres(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-micro text-slate-400 block mb-0.5">Rain Active?</label>
                  <button
                    type="button"
                    onClick={() => setSimRain(!simRain)}
                    className={`w-full py-1.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                      simRain ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {simRain ? 'RAIN DETECTED' : 'DRY SENSOR'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Send Test ESP32 Reading
              </button>

              {simStatusMsg && (
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-tiny text-sky-300 font-medium">
                  {simStatusMsg}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Live Telemetry History Chart */}
        <div className="lg:col-span-7 bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/50">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Real-Time Sensor Telemetry Curve</span>
            </h3>
            <span className="text-micro text-slate-400 font-mono">15-Minute Polling Horizon</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} name="DHT22 Temp (°C)" />
                <Line type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 3 }} name="Humidity (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Complete Firmware Source Code (Arduino / ESP32) */}
      <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/50 mb-3">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Ready-to-Flash ESP32 Firmware Source Code (C++ / Arduino IDE)
            </h3>
          </div>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition-all cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied!' : 'Copy Firmware'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Upload this sketch to an ESP32 microcontroller in the Arduino IDE. Replace <code className="text-sky-300">YOUR_WIFI_SSID</code> and <code className="text-sky-300">YOUR_SERVER_IP</code> with your local network credentials.
        </p>

        <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-tiny overflow-x-auto leading-relaxed max-h-80">
          {esp32CodeSnippet}
        </pre>
      </div>
    </div>
  );
};
