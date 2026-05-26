import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '@/constants/translations';

export interface TaskHistory {
  id: string;
  taskId: string;
  taskName: string;
  points: number;
  date: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  totalPoints: number;
  streak: number;
  taskHistory: TaskHistory[];
  addPoints: (taskId: string, taskName: string, points: number) => void;
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  LANGUAGE: 'eco_language',
  POINTS: 'eco_points',
  STREAK: 'eco_streak',
  LAST_ACTIVE: 'eco_last_active',
  HISTORY: 'eco_history',
  ONBOARDED: 'eco_onboarded',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [lang, pts, str, hist, onboarded, lastActive] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
          AsyncStorage.getItem(STORAGE_KEYS.POINTS),
          AsyncStorage.getItem(STORAGE_KEYS.STREAK),
          AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
          AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVE),
        ]);

      if (lang) setLanguageState(lang as Language);
      if (pts) setTotalPoints(parseInt(pts, 10));
      if (hist) setTaskHistory(JSON.parse(hist));
      if (onboarded === 'true') setIsOnboardedState(true);

      const today = new Date().toDateString();
      const lastActiveVal = lastActive;

      // Update streak
      const storedStreak = str ? parseInt(str, 10) : 0;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActiveVal === today) {
        setStreak(storedStreak);
      } else if (lastActiveVal === yesterday.toDateString()) {
        setStreak(storedStreak);
      } else if (lastActiveVal) {
        setStreak(0);
        await AsyncStorage.setItem(STORAGE_KEYS.STREAK, '0');
      } else {
        setStreak(storedStreak);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoaded(true);
    }
  };

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }, []);

  const setIsOnboarded = useCallback(async (val: boolean) => {
    setIsOnboardedState(val);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, val ? 'true' : 'false');
  }, []);

  const addPoints = useCallback(async (taskId: string, taskName: string, points: number) => {
    const today = new Date().toDateString();

    const newTotal = totalPoints + points;
    const newHistory: TaskHistory = {
      id: Date.now().toString(),
      taskId,
      taskName,
      points,
      date: new Date().toISOString(),
    };

    const newStreak = streak + 1;

    setTotalPoints(newTotal);
    setTaskHistory((prev) => [newHistory, ...prev]);
    setStreak(newStreak);

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.POINTS, newTotal.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([newHistory, ...taskHistory])),
      AsyncStorage.setItem(STORAGE_KEYS.STREAK, newStreak.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, today),
    ]);
  }, [totalPoints, taskHistory, streak]);

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        totalPoints,
        streak,
        taskHistory,
        addPoints,
        isOnboarded,
        setIsOnboarded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
