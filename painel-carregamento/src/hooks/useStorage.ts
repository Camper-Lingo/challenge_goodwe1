// src/hooks/useStorage.ts

import { useState, useCallback } from 'react';
import type { Car, ChargeSession, User } from '../types';
import { storageService } from '../services/storageService';

export const useStorage = () => {
  const [car, setCarState] = useState<Car | null>(() => storageService.getCar());
  const [user] = useState<User | null>(() => storageService.getUser());
  const [history, setHistory] = useState<ChargeSession[]>(() => storageService.getHistory());
  const [currentSession, setCurrentSessionState] = useState<ChargeSession | null>(
    () => storageService.getCurrentSession()
  );

  const saveCar = useCallback((newCar: Car) => {
    storageService.setCar(newCar);
    setCarState(newCar);
  }, []);

  const updateCarCharge = useCallback((newCharge: number) => {
    setCarState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, currentCharge: Math.round(newCharge) };
      storageService.setCar(updated);
      return updated;
    });
  }, []);

  const saveCharge = useCallback((session: ChargeSession) => {
    storageService.addChargeToHistory(session);
    setHistory(storageService.getHistory());
  }, []);

  const startSession = useCallback((session: ChargeSession) => {
    storageService.setCurrentSession(session);
    setCurrentSessionState(session);
  }, []);

  const updateSession = useCallback((updatedSession: ChargeSession) => {
    storageService.setCurrentSession(updatedSession);
    setCurrentSessionState(updatedSession);
  }, []);

  const endSession = useCallback(
    (finalSession: ChargeSession) => {
      storageService.addChargeToHistory(finalSession);
      storageService.clearCurrentSession();
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
    updateCarCharge,
    saveCharge,
    startSession,
    updateSession,
    endSession,
    getHistoryFiltered,
    clearAllHistory,
  };
};
