import type { ChargeSession, Tariff } from '../types';

class StorageService {
  private readonly KEYS = {
    HISTORY: 'ev_history',
    TARIFFS: 'ev_tariffs',
  };

  // ── History ───────────────────────────────────────────────────────

  addChargeToHistory(session: ChargeSession): void {
    const history = this.getHistory();

    history.unshift(session);

    localStorage.setItem(
      this.KEYS.HISTORY,
      JSON.stringify(history)
    );
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
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    );
  }

  clearHistory(): void {
    localStorage.removeItem(this.KEYS.HISTORY);
  }

  // ── Tariffs ───────────────────────────────────────────────────────

  setTariffs(tariffs: Tariff): void {
    localStorage.setItem(
      this.KEYS.TARIFFS,
      JSON.stringify(tariffs)
    );
  }

  getTariffs(): Tariff | null {
    const data = localStorage.getItem(this.KEYS.TARIFFS);

    return data ? JSON.parse(data) : null;
  }
}

export const storageService = new StorageService();