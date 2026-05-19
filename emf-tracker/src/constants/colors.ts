import { AlertLevel } from '../types';

export const COLORS = {
  background: '#0A0A0A',
  surface: '#111111',
  card: '#161616',
  border: '#2A2A2A',

  normal: '#00FF88',
  elevated: '#FFD700',
  high: '#FF8C00',
  veryHigh: '#FF2D2D',

  normalDim: '#00FF8833',
  elevatedDim: '#FFD70033',
  highDim: '#FF8C0033',
  veryHighDim: '#FF2D2D33',

  textPrimary: '#FFFFFF',
  textSecondary: '#888888',
  textMuted: '#444444',

  accent: '#00FFCC',
  accentDim: '#00FFCC22',
  white: '#FFFFFF',
};

export const ALERT_THRESHOLDS = {
  normal: 20,
  elevated: 50,
  high: 100,
};

export const ALERT_LABELS: Record<AlertLevel, string> = {
  normal: 'Normal Background',
  elevated: 'Elevated Field',
  high: 'Strong Source Nearby',
  veryHigh: 'Very Strong Field!',
};

export const ALERT_COLORS: Record<AlertLevel, string> = {
  normal: COLORS.normal,
  elevated: COLORS.elevated,
  high: COLORS.high,
  veryHigh: COLORS.veryHigh,
};

export const ALERT_DIM_COLORS: Record<AlertLevel, string> = {
  normal: COLORS.normalDim,
  elevated: COLORS.elevatedDim,
  high: COLORS.highDim,
  veryHigh: COLORS.veryHighDim,
};

export function getAlertLevel(magnitude: number): AlertLevel {
  if (magnitude < ALERT_THRESHOLDS.normal) return 'normal';
  if (magnitude < ALERT_THRESHOLDS.elevated) return 'elevated';
  if (magnitude < ALERT_THRESHOLDS.high) return 'high';
  return 'veryHigh';
}
