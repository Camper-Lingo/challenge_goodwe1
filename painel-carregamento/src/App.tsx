// src/App.tsx

import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { DashboardScreen } from './components/Screens/DashboardScreen';
import { SelectChargeScreen } from './components/Screens/SelectChargeScreen';
import { ConfirmScreen } from './components/Screens/ConfirmScreen';
import { ChargingScreen } from './components/Screens/ChargingScreen';
import { HistoryScreen } from './components/Screens/HistoryScreen';
import { SplashScreen } from './components/Screens/SplashScreen';
import { WelcomeScreen } from './components/Screens/WelcomeScreen';
import { ToastContainer } from './components/Common/Toast';
import { useStorage } from './hooks/useStorage';
import type { Screen, ChargeCalculation, ChargeSession, Tariff, ToastData, Car} from './types';

function generateRandomPlate(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const randomLetters = Array.from(
    { length: 3 },
    () => letters[Math.floor(Math.random() * letters.length)]
  ).join('');

  const randomNumbers = Math.floor(1000 + Math.random() * 9000);

  return `${randomLetters}-${randomNumbers}`;
}

function generateRandomCar(): Car {
  const cars = [
    {
      model: 'Tesla Model 3',
      batteryCapacity: 60,
      maxPower: 100,
    },
    {
      model: 'BYD Dolphin',
      batteryCapacity: 44.9,
      maxPower: 60,
    },
    {
      model: 'GWM Ora 03',
      batteryCapacity: 48,
      maxPower: 67,
    },
    {
      model: 'Volvo EX30',
      batteryCapacity: 69,
      maxPower: 153,
    },
  ];

  const selectedCar = cars[Math.floor(Math.random() * cars.length)];

  const currentCharge = Math.floor(Math.random() * 81) + 10;

  return {
    id: `car_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    model: selectedCar.model,
    licensePlate: generateRandomPlate(),
    batteryCapacity: selectedCar.batteryCapacity,
    currentCharge,
    maxPower: selectedCar.maxPower,
    temperature: Math.floor(Math.random() * 11) + 23,
  };
}
function generateRandomStation(): string {
  const stations = ['SP-001', 'SP-002', 'SP-003', 'SP-004'];

  return stations[Math.floor(Math.random() * stations.length)];
}

const DEFAULT_TARIFF: Tariff = {
  currentRate: 0.80,
  peakHours: ['18:00', '22:00'],
  offPeakRate: 0.60,
  peakRate: 1.20,
  lastUpdated: new Date().toISOString(),
};


function generateId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function App() {
  const {
    car,
    user,
    history,
    currentSession,
    saveCar,
    saveUser,
    updateCarCharge,
    startSession,
    endSession,
    clearAllHistory,
  } = useStorage();

  // 'splash' | 'welcome' são fases de onboarding; depois disso usa `screen`
  type AppPhase = 'splash' | 'welcome' | 'app';
  const [appPhase, setAppPhase] = useState<AppPhase>('splash');
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [chargeTarget, setChargeTarget] = useState(80);
  const [chargeCalc, setChargeCalc] = useState<ChargeCalculation | null>(null);
  const [activeSession, setActiveSession] = useState<ChargeSession | null>(currentSession);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [stationId] = useState(generateRandomStation);

  // Initialize mock data if needed
  useEffect(() => {
  // Cada carregamento da página representa um novo cliente
  localStorage.removeItem('ev_user');
  localStorage.removeItem('ev_current_session');

  // Gera um novo carro para esse cliente
  const newCar = generateRandomCar();
  saveCar(newCar);

  // Começa sem sessão ativa
  setActiveSession(null);
}, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Splash complete → ir para Welcome (novo user) ou Dashboard (user existente)
  const handleSplashComplete = useCallback(() => {
    setAppPhase('welcome');
  }, []);

// Welcome: salvar nome e ir para o app
const handleNameSubmit = useCallback(
  (name: string, surname: string) => {
    saveUser({
      id: `user_${Date.now()}`,
      name,
      surname,
      email: '',
      createdAt: new Date().toISOString(),
    });

    setAppPhase('app');
  },
  [saveUser]
);

  const addToast = useCallback((message: string, type: ToastData['type'] = 'info') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Screen handlers ────────────────────────────────────────────────

  const handleConnectCar = useCallback(() => {
    const newCar = generateRandomCar();

    saveCar(newCar);
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
      licensePlate: car.licensePlate,
      startBattery: car.currentCharge,
      endBattery: chargeTarget,
      energyUsed: chargeCalc.energyNeeded,
      costPerKwh: DEFAULT_TARIFF.currentRate,
      totalCost: chargeCalc.totalCostRaw,
      duration: chargeCalc.estimatedTime,
      status: 'charging',
      stationId,
    };

    startSession(session);
    setActiveSession(session);
    setScreen('charging');
    addToast('Carregamento iniciado!', 'success');
  }, [car, chargeCalc, chargeTarget, startSession, addToast, stationId]);

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

  // ── ONBOARDING PHASES ─────────────────────────────────────────────
  if (appPhase === 'splash') {
    return <SplashScreen onLoadingComplete={handleSplashComplete} duration={3500} />;
  }
  if (appPhase === 'welcome') {
    return <WelcomeScreen onNameSubmit={handleNameSubmit} />;
  }

  // ── MAIN APP ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Header
        currentScreen={screen}
        onNavigate={handleNavigate}
        stationId={stationId}
        userName={user?.name}
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
