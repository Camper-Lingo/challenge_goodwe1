import { useState, useCallback } from 'react';

import type { Car, ChargeSession, User } from '../types';

import { storageService } from '../services/storageService';

export const useStorage = () => {
  const [car, setCarState] = useState<Car | null>(null);

  const [user, setUserState] = useState<User | null>(null);

  const [history, setHistory] = useState<ChargeSession[]>(
    () => storageService.getHistory()
  );

  const [currentSession, setCurrentSessionState] =
    useState<ChargeSession | null>(null);

  const saveCar = useCallback((newCar: Car) => {
    setCarState(newCar);
  }, []);

  const saveUser = useCallback((newUser: User) => {
    setUserState(newUser);
  }, []);

  const clearUser = useCallback(() => {
    setUserState(null);
  }, []);

  const updateCarCharge = useCallback((newCharge: number) => {
    setCarState((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        currentCharge: Math.round(newCharge),
      };
    });
  }, []);

  const saveCharge = useCallback((session: ChargeSession) => {
    storageService.addChargeToHistory(session);
    setHistory(storageService.getHistory());
  }, []);

  const startSession = useCallback((session: ChargeSession) => {
    setCurrentSessionState(session);
  }, []);

  const updateSession = useCallback(
    (updatedSession: ChargeSession) => {
      setCurrentSessionState(updatedSession);
    },
    []
  );

  const endSession = useCallback(
    (finalSession: ChargeSession) => {
      storageService.addChargeToHistory(finalSession);

      setCurrentSessionState(null);

      setHistory(storageService.getHistory());
    },
    []
  );

  const getHistoryFiltered = useCallback((days: number) => {
    return storageService.getHistory(days);
  }, []);

  const clearAllHistory = useCallback(() => {
    storageService.clearHistory();
    setHistory([]);
  }, []);

  return {
    car,
    user,
    history,
    currentSession,
    saveCar,
    saveUser,
    clearUser,
    updateCarCharge,
    saveCharge,
    startSession,
    updateSession,
    endSession,
    getHistoryFiltered,
    clearAllHistory,
  };
};