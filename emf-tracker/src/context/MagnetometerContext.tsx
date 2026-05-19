import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Magnetometer } from 'expo-sensors';
import { AlertLevel, HistoryPoint, MagnetometerReading } from '../types';
import { getAlertLevel } from '../constants/colors';

const MAX_HISTORY = 600; // 60 s at 10 Hz
const UPDATE_INTERVAL_MS = 100;
const CHANGE_THRESHOLD = 0.5;

interface MagnetometerContextType {
  reading: MagnetometerReading;
  alertLevel: AlertLevel;
  isAvailable: boolean | null;
  history: HistoryPoint[];
  sessionMin: number;
  sessionMax: number;
  sessionAvg: number;
  sessionCount: number;
}

const defaultReading: MagnetometerReading = {
  x: 0,
  y: 0,
  z: 0,
  magnitude: 0,
  timestamp: Date.now(),
};

const MagnetometerContext = createContext<MagnetometerContextType>({
  reading: defaultReading,
  alertLevel: 'normal',
  isAvailable: null,
  history: [],
  sessionMin: 0,
  sessionMax: 0,
  sessionAvg: 0,
  sessionCount: 0,
});

export function MagnetometerProvider({ children }: { children: React.ReactNode }) {
  const [reading, setReading] = useState<MagnetometerReading>(defaultReading);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  const lastMagnitudeRef = useRef(0);
  const historyRef = useRef<HistoryPoint[]>([]);
  const statsRef = useRef({ min: Infinity, max: 0, sum: 0, count: 0 });

  useEffect(() => {
    let subscription: ReturnType<typeof Magnetometer.addListener> | null = null;

    const setup = async () => {
      const available = await Magnetometer.isAvailableAsync();
      setIsAvailable(available);
      if (!available) return;

      Magnetometer.setUpdateInterval(UPDATE_INTERVAL_MS);

      subscription = Magnetometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);

        if (Math.abs(magnitude - lastMagnitudeRef.current) < CHANGE_THRESHOLD) return;
        lastMagnitudeRef.current = magnitude;

        const point: HistoryPoint = { magnitude, timestamp: Date.now() };
        const newHistory = [...historyRef.current, point];
        if (newHistory.length > MAX_HISTORY) newHistory.shift();
        historyRef.current = newHistory;

        const stats = statsRef.current;
        stats.count += 1;
        stats.sum += magnitude;
        if (magnitude < stats.min) stats.min = magnitude;
        if (magnitude > stats.max) stats.max = magnitude;

        setReading({
          x: parseFloat(x.toFixed(2)),
          y: parseFloat(y.toFixed(2)),
          z: parseFloat(z.toFixed(2)),
          magnitude: parseFloat(magnitude.toFixed(2)),
          timestamp: Date.now(),
        });

        setHistory([...newHistory]);
      });
    };

    setup();
    return () => {
      subscription?.remove();
    };
  }, []);

  const stats = statsRef.current;
  const sessionMin = stats.count > 0 ? stats.min : 0;
  const sessionMax = stats.max;
  const sessionAvg = stats.count > 0 ? stats.sum / stats.count : 0;

  return (
    <MagnetometerContext.Provider
      value={{
        reading,
        alertLevel: getAlertLevel(reading.magnitude),
        isAvailable,
        history,
        sessionMin,
        sessionMax,
        sessionAvg,
        sessionCount: stats.count,
      }}
    >
      {children}
    </MagnetometerContext.Provider>
  );
}

export function useMagnetometer() {
  return useContext(MagnetometerContext);
}
