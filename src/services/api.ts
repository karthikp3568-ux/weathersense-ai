/**
 * Centralized API configuration and fetch wrapper
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.message || `Server responded with status ${res.status}`);
    }

    return await res.json();
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[WeatherSense API] Request to ${endpoint} failed:`, errMsg);
    throw err;
  }
}

export { BASE_URL };
