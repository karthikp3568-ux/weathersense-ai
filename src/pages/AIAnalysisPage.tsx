import React, { useState } from 'react';
import { WeatherData, ForecastData, AIAnalysisResult } from '../types/weather';
import { requestWeatherAnalysis } from '../services/aiService';
import {
  Sparkles,
  Thermometer,
  Wind,
  ShieldAlert,
  Brain,
  CheckCircle2,
  RefreshCw,
  Info,
  Clock,
  Compass,
} from 'lucide-react';

interface AIAnalysisPageProps {
  weather: WeatherData | null;
  forecast: ForecastData | null;
}

export const AIAnalysisPage: React.FC<AIAnalysisPageProps> = ({ weather, forecast }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    if (!weather) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await requestWeatherAnalysis(weather, forecast || undefined);
      setAnalysis(result);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(`AI analysis request failed: ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Brain className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Google Gemini 3.8 Flash • Secure Backend Proxy
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            AI-Powered Meteorological Synthesis
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Interprets thermodynamic parameters, dew points, pressure gradients, and precipitation probability. Generates clear, non-technical advisories grounded strictly in real sensor observations.
          </p>
        </div>

        <div>
          <button
            onClick={handleRunAnalysis}
            disabled={isLoading || !weather}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating Atmosphere...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Analyze Weather with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Location Snapshot */}
      {weather && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" />
            <span className="text-slate-400">Target Station:</span>
            <span className="font-bold text-white">{weather.city}, {weather.country}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 font-mono">
            <span>Temp: <strong className="text-white">{weather.temperature}°C</strong></span>
            <span>Humidity: <strong className="text-white">{weather.humidity}%</strong></span>
            <span>Wind: <strong className="text-white">{weather.wind_speed} km/h</strong></span>
            <span>Pressure: <strong className="text-white">{weather.pressure} hPa</strong></span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* If No Analysis Run Yet */}
      {!analysis && !isLoading && (
        <div className="bg-slate-800/30 border border-slate-700/40 rounded-3xl p-12 text-center max-w-xl mx-auto my-6 space-y-3">
          <div className="inline-flex p-4 rounded-3xl bg-purple-500/10 text-purple-400 mb-2">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">Ready for Comprehensive AI Analysis</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click the &quot;Analyze Weather with AI&quot; button above to prompt Google Gemini via our secure Express backend proxy. The model will analyze current temperature, barometric stability, and precipitation indices.
          </p>
        </div>
      )}

      {/* Loading Shimmer State */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 rounded-2xl bg-purple-950/20 border border-purple-500/20 p-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 rounded-2xl bg-slate-800/40 border border-slate-700/40" />
            <div className="h-40 rounded-2xl bg-slate-800/40 border border-slate-700/40" />
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysis && !isLoading && (
        <div className="space-y-6">
          {/* Provider and Disclaimer Banner */}
          <div
            className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
              analysis.provider === 'gemini'
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                {analysis.provider === 'gemini'
                  ? 'Generated by Google Gemini (gemini-3.8-flash) via secure backend endpoint.'
                  : 'Backend rule-based fallback analysis active. Configure GEMINI_API_KEY in .env for generative insights.'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-tiny text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Generated at {analysis.generated_at}</span>
            </div>
          </div>

          {/* 1. Executive Meteorological Summary */}
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <Brain className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Executive Meteorological Overview
              </h3>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {analysis.summary}
            </p>
          </div>

          {/* 2. Deep Thermodynamic & Fluid Dynamics Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thermal Comfort & Moisture */}
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Thermometer className="w-4 h-4" />
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Thermal Index &amp; Relative Humidity
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.thermal_analysis}
              </p>
            </div>

            {/* Wind Vector & Pressure Tendency */}
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                  <Wind className="w-4 h-4" />
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Wind Vectors &amp; Precipitation Tendency
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.wind_precip_insight}
              </p>
            </div>
          </div>

          {/* 3. Actionable Precautions & Advisories */}
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/50">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Operational, Agricultural &amp; Commuter Precautions
                </h3>
                <p className="text-tiny text-slate-400">
                  Recommended measures derived from telemetry thresholds
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {analysis.agricultural_and_lifestyle_precautions?.map((precaution, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-700/50 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-snug">{precaution}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notice on Official Warnings */}
          <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40 text-tiny text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Disclaimer: WeatherSense AI provides data-driven situational awareness for academic and monitoring purposes. Always consult national meteorological agencies for official severe storm warnings.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
