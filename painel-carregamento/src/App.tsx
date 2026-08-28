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
import {
  createCustomer,
  createVehicle,
  getStations,
  saveChargeSession,
  type ApiStation,
} from './services/apiClient';
import type { Screen, ChargeCalculation, ChargeSession, Tariff, ToastData, Car } from './types';

function generateRandomPlate(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const randomLetters = Array.from(
    { length: 3 },
    () => letters[Math.floor(Math.random() * letters.length)]
  ).join('');

  const randomNumbers = Math.floor(1000 + Math.random() * 9000);

  return `${randomLetters}-${randomNumbers}`;
}

// Agora retorna os dados "crus" do carro sorteado, sem o id (o id vem do backend)
function pickRandomCarSpecs() {
  const cars = [
    { model: 'Tesla Model 3', batteryCapacity: 60, maxPower: 100 },
    { model: 'BYD Dolphin', batteryCapacity: 44.9, maxPower: 60 },
    { model: 'GWM Ora 03', batteryCapacity: 48, maxPower: 67 },
    { model: 'Volvo EX30', batteryCapacity: 69, maxPower: 153 },
  ];

  const selectedCar = cars[Math.floor(Math.random() * cars.length)];
  const currentCharge = Math.floor(Math.random() * 81) + 10;

  return {
    model: selectedCar.model,
    licensePlate: generateRandomPlate(),
    batteryCapacity: selectedCar.batteryCapacity,
    currentCharge,
    maxPower: selectedCar.maxPower,
    temperature: Math.floor(Math.random() * 11) + 23,
  };
}

function App() {
  const [tariff, setTariff] = useState<Tariff>({
  currentRate: 0,
  peakHours: [],
  offPeakRate: 0,
  peakRate: 0,
  lastUpdated: '',
});

useEffect(() => {
  const fetchTariff = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/tariff');

      if (!response.ok) {
        throw new Error('Erro ao buscar tarifa');
      }

      const data = await response.json();

      setTariff({
        currentRate: data.rate,
        peakHours: [],
        offPeakRate: 0,
        peakRate: data.rate,
        lastUpdated: data.current_time,
      });

    } catch (error) {
      console.error('Erro ao carregar tarifa:', error);
    }
  };

  fetchTariff();
}, []);

function generateId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
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

  // ── IDs do banco de dados (não existiam antes — o front só tinha ids locais) ──
  const [dbCustomerId, setDbCustomerId] = useState<number | null>(null);
  const [dbVehicleId, setDbVehicleId] = useState<number | null>(null);
  const [apiStations, setApiStations] = useState<ApiStation[]>([]);
  const [station, setStation] = useState<ApiStation | null>(null);

  const addToast = useCallback((message: string, type: ToastData['type'] = 'info') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Busca as estações reais do banco assim que o app abre (não depende do cliente)
  useEffect(() => {
    getStations()
      .then((stations) => {
        setApiStations(stations);
        if (stations.length > 0) {
          const sorteada = stations[Math.floor(Math.random() * stations.length)];
          setStation(sorteada);
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar estações:', err);
        addToast('Não foi possível conectar ao servidor', 'error');
      });
  }, [addToast]);

  // Reset ao abrir o app — sem gerar carro aqui (isso agora acontece
  // só depois que o cliente é criado no backend, dentro de handleNameSubmit)
  useEffect(() => {
    localStorage.removeItem('ev_user');
    localStorage.removeItem('ev_current_session');
    setActiveSession(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Splash complete → ir para Welcome
  const handleSplashComplete = useCallback(() => {
    setAppPhase('welcome');
  }, []);

  // Welcome: cria cliente + carro no backend, depois entra no app
  const handleNameSubmit = useCallback(
    async (name: string, surname: string) => {
      try {
        // 1. Cria o cliente de verdade no banco
        const { customer_id } = await createCustomer(name, surname);
        setDbCustomerId(customer_id);

        // 2. Sorteia as specs do carro (sua lógica original) e grava no banco
        const specs = pickRandomCarSpecs();
        const { vehicle_id } = await createVehicle({
          customer_id,
          model: specs.model,
          plate: specs.licensePlate,
          battery_capacity_kwh: specs.batteryCapacity,
          max_power_kw: specs.maxPower,
        });
        setDbVehicleId(vehicle_id);

        // 3. Monta o objeto Car do jeito que o front já espera
        const newCar: Car = {
          id: `car_${vehicle_id}`,
          model: specs.model,
          licensePlate: specs.licensePlate,
          batteryCapacity: specs.batteryCapacity,
          currentCharge: specs.currentCharge,
          maxPower: specs.maxPower,
          temperature: specs.temperature,
        };
        saveCar(newCar);

        // 4. Salva o usuário localmente (igual já fazia)
        saveUser({
          id: `user_${customer_id}`,
          name,
          surname,
          email: '',
          createdAt: new Date().toISOString(),
        });

        setAppPhase('app');
      } catch (err) {
        console.error('Erro ao criar cliente/carro no backend:', err);
        addToast('Erro ao conectar com o servidor. Tente novamente.', 'error');
      }
    },
    [saveCar, saveUser, addToast]
  );

  // ── Screen handlers ────────────────────────────────────────────────

  const handleConnectCar = useCallback(async () => {
    if (!dbCustomerId) {
      addToast('Cliente não identificado ainda', 'error');
      return;
    }

    try {
      const specs = pickRandomCarSpecs();
      const { vehicle_id } = await createVehicle({
        customer_id: dbCustomerId,
        model: specs.model,
        plate: specs.licensePlate,
        battery_capacity_kwh: specs.batteryCapacity,
        max_power_kw: specs.maxPower,
      });
      setDbVehicleId(vehicle_id);

      const newCar: Car = {
        id: `car_${vehicle_id}`,
        model: specs.model,
        licensePlate: specs.licensePlate,
        batteryCapacity: specs.batteryCapacity,
        currentCharge: specs.currentCharge,
        maxPower: specs.maxPower,
        temperature: specs.temperature,
      };

      saveCar(newCar);
      addToast('Veículo conectado com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao conectar veículo:', err);
      addToast('Erro ao conectar veículo', 'error');
    }
  }, [dbCustomerId, saveCar, addToast]);

  const handleChargeClick = useCallback(() => {
    setScreen('select');
  }, []);

  const handleSelectContinue = useCallback((target: number, calc: ChargeCalculation) => {
    setChargeTarget(target);
    setChargeCalc(calc);
    setScreen('confirm');
  }, []);

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
      costPerKwh: tariff.currentRate,
      totalCost: chargeCalc.totalCostRaw,
      duration: chargeCalc.estimatedTime,
      status: 'charging',
      stationId: station?.code ?? 'SP-001',
    };

    startSession(session);
    setActiveSession(session);
    setScreen('charging');
    addToast('Carregamento iniciado!', 'success');
  }, [car, chargeCalc, chargeTarget, tariff, startSession, addToast, station]);

  const handleChargingPause = useCallback(() => {
    addToast('Carregamento pausado', 'info');
  }, [addToast]);

  const handleChargingStop = useCallback(
    (finalSession: ChargeSession) => {
      // Salva localmente (comportamento que já existia)
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

      // ── NOVO: grava a sessão de verdade no backend ──
      if (dbCustomerId && dbVehicleId && station) {
        saveChargeSession({
          customer_id: dbCustomerId,
          vehicle_id: dbVehicleId,
          station_id: station.id,
          start_battery_pct: finalSession.startBattery,
          end_battery_pct: finalSession.endBattery,
          energy_used_kwh: finalSession.energyUsed,
          cost_per_kwh: finalSession.costPerKwh,
          total_cost: finalSession.totalCost,
          started_at: finalSession.timestamp,
          ended_at: new Date().toISOString(),
          duration_minutes: finalSession.duration,
          status: finalSession.status,
        }).catch((err) => {
          console.error('Erro ao salvar sessão no backend:', err);
          addToast('Sessão salva localmente, mas falhou ao sincronizar', 'warning');
        });
      } else {
        console.warn('Faltam IDs do backend — sessão não foi sincronizada com o banco.');
      }
    },
    [endSession, addToast, dbCustomerId, dbVehicleId, station]
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
        stationId={station?.code ?? '—'}
        userName={user?.name}
      />

      <main className="max-w-lg mx-auto px-4 py-6">
        {screen === 'dashboard' && (
          <DashboardScreen
            car={car}
            tariff={tariff}
            onChargeClick={handleChargeClick}
            onHistoryClick={() => setScreen('history')}
            onConnectCar={handleConnectCar}
          />
        )}

        {screen === 'select' && car && (
          <SelectChargeScreen
            car={car}
            tariff={tariff}
            onBack={() => setScreen('dashboard')}
            onContinue={handleSelectContinue}
          />
        )}

        {screen === 'confirm' && car && chargeCalc && (
          <ConfirmScreen
            car={car}
            targetBattery={chargeTarget}
            calculation={chargeCalc}
            stationId={station?.code ?? 'SP-001'}
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
