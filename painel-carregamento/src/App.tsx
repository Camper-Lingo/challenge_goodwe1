// src/App.tsx

import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { DashboardScreen } from './components/Screens/DashboardScreen';
import { SelectChargeScreen } from './components/Screens/SelectChargeScreen';
import { ConfirmScreen } from './components/Screens/ConfirmScreen';
import { ChargingScreen } from './components/Screens/ChargingScreen';
import { HistoryScreen } from './components/Screens/HistoryScreen';
import { ToastContainer } from './components/Common/Toast';
import { useStorage } from './hooks/useStorage';
import type { Screen, ChargeCalculation, ChargeSession, Tariff, ToastData, Car } from './types';

const MOCK_CAR: Car = {
  id: 'car_001',
  model: 'Tesla Model 3',
  batteryCapacity: 60,
  currentCharge: 32,
  maxPower: 100,
  temperature: 28,
};

const DEFAULT_TARIFF: Tariff = {
  currentRate: 0.80,
  peakHours: ['18:00', '22:00'],
  offPeakRate: 0.60,
  peakRate: 1.20,
  lastUpdated: new Date().toISOString(),
};

const MOCK_HISTORY: ChargeSession[] = [
  {
    id: 'hist_001',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    carId: 'car_001',
    carModel: 'Tesla Model 3',
    startBattery: 10,
    endBattery: 80,
    energyUsed: 42.0,
    costPerKwh: 0.80,
    totalCost: 33.60,
    duration: 25,
    status: 'completed',
    stationId: 'SP-001',
  },
  {
    id: 'hist_002',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    carId: 'car_001',
    carModel: 'Tesla Model 3',
    startBattery: 45,
    endBattery: 90,
    energyUsed: 28.4,
    costPerKwh: 0.80,
    totalCost: 22.72,
    duration: 17,
    status: 'completed',
    stationId: 'SP-001',
  },
  {
    id: 'hist_003',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    carId: 'car_001',
    carModel: 'Tesla Model 3',
    startBattery: 20,
    endBattery: 50,
    energyUsed: 18.9,
    costPerKwh: 0.80,
    totalCost: 15.12,
    duration: 11,
    status: 'completed',
    stationId: 'SP-001',
  },
  {
    id: 'hist_004',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    carId: 'car_001',
    carModel: 'Tesla Model 3',
    startBattery: 60,
    endBattery: 70,
    energyUsed: 6.3,
    costPerKwh: 0.80,
    totalCost: 5.04,
    duration: 4,
    status: 'cancelled',
    stationId: 'SP-001',
  },
];

function generateId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function App() {
  const {
    car,
    history,
    currentSession,
    saveCar,
    updateCarCharge,
    startSession,
    endSession,
    clearAllHistory,
    saveCharge,
  } = useStorage();

  const [screen, setScreen] = useState<Screen>('dashboard');
  const [chargeTarget, setChargeTarget] = useState(80);
  const [chargeCalc, setChargeCalc] = useState<ChargeCalculation | null>(null);
  const [activeSession, setActiveSession] = useState<ChargeSession | null>(currentSession);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Initialize mock data if needed
  useEffect(() => {
    if (!car) {
      saveCar(MOCK_CAR);
    }
    // Seed history if empty
    const stored = localStorage.getItem('ev_history');
    const existing = stored ? JSON.parse(stored) : [];
    if (existing.length === 0) {
      MOCK_HISTORY.forEach((s) => saveCharge(s));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Resume active session if app reloads mid-charge
  useEffect(() => {
    if (currentSession && currentSession.status === 'charging') {
      setActiveSession(currentSession);
      setScreen('charging');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addToast = useCallback((message: string, type: ToastData['type'] = 'info') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Screen handlers ────────────────────────────────────────────────

  const handleConnectCar = useCallback(() => {
    saveCar(MOCK_CAR);
    addToast('Veículo conectado com sucesso!', 'success');
  }, [saveCar, addToast]);

  const handleChargeClick = useCallback(() => {
    setScreen('select');
  }, []);

  const handleSelectContinue = useCallback(
    (target: number, calc: ChargeCalculation) => {
      setChargeTarget(target);
      setChargeCalc(calc);
      setScreen('confirm');
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (!car || !chargeCalc) return;

    const session: ChargeSession = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      carId: car.id,
      carModel: car.model,
      startBattery: car.currentCharge,
      endBattery: chargeTarget,
      energyUsed: chargeCalc.energyNeeded,
      costPerKwh: DEFAULT_TARIFF.currentRate,
      totalCost: chargeCalc.totalCostRaw,
      duration: chargeCalc.estimatedTime,
      status: 'charging',
      stationId: 'SP-001',
    };

    startSession(session);
    setActiveSession(session);
    setScreen('charging');
    addToast('Carregamento iniciado!', 'success');
  }, [car, chargeCalc, chargeTarget, startSession, addToast]);

  const handleChargingPause = useCallback(() => {
    addToast('Carregamento pausado', 'info');
  }, [addToast]);

  const handleChargingStop = useCallback(
    (finalSession: ChargeSession) => {
      endSession(finalSession);
      setActiveSession(null);
      setScreen('dashboard');

      if (finalSession.status === 'completed') {
        addToast(
          `Carregamento concluído! +${finalSession.endBattery - finalSession.startBattery}%`,
          'success'
        );
      } else {
        addToast('Carregamento encerrado', 'warning');
      }
    },
    [endSession, addToast]
  );


  const handleCarChargeUpdate = useCallback(
    (charge: number) => {
      updateCarCharge(charge);
    },
    [updateCarCharge]
  );

  const handleNavigate = useCallback(
    (s: Screen) => {
      if (s === screen) return;
      if (screen === 'charging' && activeSession) {
        addToast('Carregamento em andamento — encerre primeiro', 'warning');
        return;
      }
      setScreen(s);
    },
    [screen, activeSession, addToast]
  );

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Header
        currentScreen={screen}
        onNavigate={handleNavigate}
        stationId="SP-001"
      />

      <main className="max-w-lg mx-auto px-4 py-6">
        {screen === 'dashboard' && (
          <DashboardScreen
            car={car}
            tariff={DEFAULT_TARIFF}
            onChargeClick={handleChargeClick}
            onHistoryClick={() => setScreen('history')}
            onConnectCar={handleConnectCar}
          />
        )}

        {screen === 'select' && car && (
          <SelectChargeScreen
            car={car}
            tariff={DEFAULT_TARIFF}
            onBack={() => setScreen('dashboard')}
            onContinue={handleSelectContinue}
          />
        )}

        {screen === 'confirm' && car && chargeCalc && (
          <ConfirmScreen
            car={car}
            targetBattery={chargeTarget}
            calculation={chargeCalc}
            stationId="SP-001"
            onBack={() => setScreen('select')}
            onConfirm={handleConfirm}
          />
        )}

        {screen === 'charging' && car && activeSession && chargeCalc && (
          <ChargingScreen
            car={car}
            session={activeSession}
            calculation={chargeCalc}
            onPause={handleChargingPause}
            onStop={handleChargingStop}
            onCarChargeUpdate={handleCarChargeUpdate}
          />
        )}

        {screen === 'history' && (
          <HistoryScreen
            history={history}
            onClearHistory={clearAllHistory}
            onBack={() => setScreen('dashboard')}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;
