import { apiRequest } from './api';
import { IoTStationData, IoTReadingHistory } from '../types/weather';
import { SAMPLE_IOT_STATION, SAMPLE_IOT_HISTORY } from '../data/sampleData';

export async function fetchStationData(): Promise<{ stations: IoTStationData[]; history: IoTReadingHistory[] }> {
  try {
    const data = await apiRequest<{ stations: IoTStationData[]; history: IoTReadingHistory[] }>('/stations');
    return data;
  } catch {
    return {
      stations: [SAMPLE_IOT_STATION],
      history: SAMPLE_IOT_HISTORY,
    };
  }
}

export async function postSensorReading(reading: {
  temperature: number;
  humidity: number;
  pressure?: number;
  wind_speed?: number;
  rain_detected?: boolean;
  station_id?: string;
}): Promise<{ success: boolean; message: string; station?: IoTStationData }> {
  try {
    const data = await apiRequest<{ success: boolean; message: string; station: IoTStationData }>('/stations/readings', {
      method: 'POST',
      body: JSON.stringify(reading),
    });
    return data;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to transmit sensor reading: ${errMsg}`,
    };
  }
}
