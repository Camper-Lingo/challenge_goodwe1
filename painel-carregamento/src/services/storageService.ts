// src/services/storageService.ts

import type { Car, ChargeSession, Tariff, User } from '../types';

class StorageService {
  private readonly KEYS = {
    USER: 'ev_user',
    CAR: 'ev_car',
    HISTORY: 'ev_history',
    CURRENT_SESSION: 'ev_current_session',
    TARIFFS: 'ev_tariffs',
  };

  // ── User ──────────────────────────────────────────────────────────
  setUser(user: User): void {
    localStorage.setItem(this.KEYS.USER, JSON.stringify(user));
  }
  getUser(): User | null {
    const data = localStorage.getItem(this.KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  // ── Car ───────────────────────────────────────────────────────────
  setCar(car: Car): void {
    localStorage.setItem(this.KEYS.CAR, JSON.stringify(car));
  }
  getCar(): Car | null {
    const data = localStorage.getItem(this.KEYS.CAR);
    return data ? JSON.parse(data) : null;
  }

  // ── History ───────────────────────────────────────────────────────
  addChargeToHistory(session: ChargeSession): void {
    const history = this.getHistory();
    history.unshift(session);
    localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
  }
  getHistory(filterDays?: number): ChargeSession[] {
    const data = localStorage.getItem(this.KEYS.HISTORY);
    let history: ChargeSession[] = data ? JSON.parse(data) : [];
    if (filterDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - filterDays);
      history = history.filter(
        (s) => new Date(s.timestamp) >= cutoff
      );
    }
    return history.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  clearHistory(): void {
    localStorage.removeItem(this.KEYS.HISTORY);
  }

  // ── Current Session ───────────────────────────────────────────────
  setCurrentSession(session: ChargeSession): void {
    localStorage.setItem(this.KEYS.CURRENT_SESSION, JSON.stringify(session));
  }
  getCurrentSession(): ChargeSession | null {
    const data = localStorage.getItem(this.KEYS.CURRENT_SESSION);
    return data ? JSON.parse(data) : null;
  }
  clearCurrentSession(): void {
    localStorage.removeItem(this.KEYS.CURRENT_SESSION);
  }

  // ── Tariffs ───────────────────────────────────────────────────────
  setTariffs(tariffs: Tariff): void {
    localStorage.setItem(this.KEYS.TARIFFS, JSON.stringify(tariffs));
  }
  getTariffs(): Tariff | null {
    const data = localStorage.getItem(this.KEYS.TARIFFS);
    return data ? JSON.parse(data) : null;
  }
}

export const storageService = new StorageService();
