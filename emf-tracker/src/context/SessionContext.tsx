import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveSession, Session } from '../types';
import { useMagnetometer } from './MagnetometerContext';

const SESSIONS_KEY = '@emf_tracker_sessions_v1';

interface SessionContextType {
  sessions: Session[];
  activeSession: ActiveSession | null;
  loading: boolean;
  startSession: (name: string) => void;
  stopSession: (notes?: string) => Promise<Session | null>;
  deleteSession: (id: string) => Promise<void>;
  updateNotes: (id: string, notes: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  sessions: [],
  activeSession: null,
  loading: true,
  startSession: () => {},
  stopSession: async () => null,
  deleteSession: async () => {},
  updateNotes: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { reading } = useMagnetometer();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);

  const activeRef = useRef<ActiveSession | null>(null);
  activeRef.current = activeSession;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSIONS_KEY);
        if (raw) setSessions(JSON.parse(raw));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Feed live readings into the active session
  useEffect(() => {
    if (!activeRef.current) return;
    const { magnitude } = reading;
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        peakReading: Math.max(prev.peakReading, magnitude),
        sum: prev.sum + magnitude,
        readingCount: prev.readingCount + 1,
      };
    });
  }, [reading]);

  const persistSessions = useCallback(async (updated: Session[]) => {
    setSessions(updated);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  }, []);

  const startSession = useCallback((name: string) => {
    const session: ActiveSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || `Session ${new Date().toLocaleTimeString()}`,
      startTime: Date.now(),
      peakReading: 0,
      sum: 0,
      readingCount: 0,
    };
    setActiveSession(session);
  }, []);

  const stopSession = useCallback(
    async (notes = ''): Promise<Session | null> => {
      const active = activeRef.current;
      if (!active) return null;

      const finished: Session = {
        id: active.id,
        name: active.name,
        startTime: active.startTime,
        endTime: Date.now(),
        peakReading: parseFloat(active.peakReading.toFixed(2)),
        averageReading:
          active.readingCount > 0
            ? parseFloat((active.sum / active.readingCount).toFixed(2))
            : 0,
        readingCount: active.readingCount,
        notes,
      };

      setActiveSession(null);
      const updated = [finished, ...sessions];
      await persistSessions(updated);
      return finished;
    },
    [sessions, persistSessions]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      const updated = sessions.filter((s) => s.id !== id);
      await persistSessions(updated);
    },
    [sessions, persistSessions]
  );

  const updateNotes = useCallback(
    async (id: string, notes: string) => {
      const updated = sessions.map((s) => (s.id === id ? { ...s, notes } : s));
      await persistSessions(updated);
    },
    [sessions, persistSessions]
  );

  return (
    <SessionContext.Provider
      value={{
        sessions,
        activeSession,
        loading,
        startSession,
        stopSession,
        deleteSession,
        updateNotes,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
