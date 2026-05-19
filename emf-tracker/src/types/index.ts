export interface MagnetometerReading {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  timestamp: number;
}

export interface HistoryPoint {
  magnitude: number;
  timestamp: number;
}

export type AlertLevel = 'normal' | 'elevated' | 'high' | 'veryHigh';

export interface Session {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  peakReading: number;
  averageReading: number;
  readingCount: number;
  notes: string;
}

export interface ActiveSession {
  id: string;
  name: string;
  startTime: number;
  peakReading: number;
  sum: number;
  readingCount: number;
}
