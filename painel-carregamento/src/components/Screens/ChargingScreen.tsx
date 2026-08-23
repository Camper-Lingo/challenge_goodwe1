// src/components/Screens/ChargingScreen.tsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Zap, Battery, Clock, Thermometer, Pause, Square, TrendingUp, Flag } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { Car, ChargeSession, ChargeCalculation } from '../../types';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import { CircularProgress } from '../Common/CircularProgress';
import { formatCurrency, formatTime, } from '../../utils/formatters';

interface ChargingScreenProps {
  car: Car;
  session: ChargeSession;
  calculation: ChargeCalculation;
  onPause: () => void;
  onStop: (finalSession: ChargeSession) => void;
  onCarChargeUpdate: (charge: number) => void;
}

interface PowerPoint {
  time: number;
  power: number;
}

export const ChargingScreen: React.FC<ChargingScreenProps> = ({
  car,
  session,
  calculation,
  onPause,
  onStop,
  onCarChargeUpdate,
}) => {
  const [currentBattery, setCurrentBattery] = useState(session.startBattery);
  const [energyDelivered, setEnergyDelivered] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [temperature, setTemperature] = useState(car.temperature ?? 28);
  const [currentPower, setCurrentPower] = useState(calculation.powerAvailable);
  const [powerHistory, setPowerHistory] = useState<PowerPoint[]>([
    { time: 0, power: calculation.powerAvailable },
  ]);
  const [boltPulse, setBoltPulse] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef(session);
  const pausedRef = useRef(false);
  const finishedRef = useRef(false); // guard: finishSession fires only once
  pausedRef.current = paused;

  const targetBattery = session.endBattery;
  const totalEnergyNeeded = calculation.energyNeeded;

  const estimatedTotalSeconds = calculation.estimatedTime * 60;
  const remainingSeconds = Math.max(0, estimatedTotalSeconds - elapsedSeconds);

  const finishSession = useCallback(
    (finalBattery: number, finalEnergy: number, elapsed: number) => {
      if (finishedRef.current) return; // already completed, skip
      finishedRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      const costSoFar = finalEnergy * session.costPerKwh;
      const finalSess: ChargeSession = {
        ...sessionRef.current,
        endBattery: Math.round(finalBattery),
        energyUsed: Math.round(finalEnergy * 10) / 10,
        totalCost: Math.round(costSoFar * 100) / 100,
        duration: Math.max(1, Math.round(elapsed / 60)),
        status: 'completed',
      };
      onCarChargeUpdate(Math.round(finalBattery));
      onStop(finalSess);
    },
    [session.costPerKwh, onCarChargeUpdate, onStop]
  );

  useEffect(() => {
    // Bolt pulse toggle
    const boltTimer = setInterval(() => setBoltPulse((p) => !p), 800);
    return () => clearInterval(boltTimer);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (pausedRef.current) return;

      setElapsedSeconds((prev) => prev + 1);

      // Simulate charging: increase battery by ~0.4-0.7% per second
      setCurrentBattery((prev) => {
        if (finishedRef.current) return prev;
        const increment = 0.4 + Math.random() * 0.3;
        const next = Math.min(targetBattery, prev + increment);
        onCarChargeUpdate(next);
        return next;
      });

      // Check completion outside setState to avoid double-firing
      setCurrentBattery((prev) => {
        if (!finishedRef.current && prev >= targetBattery) {
          setEnergyDelivered((e) => {
            setElapsedSeconds((s) => {
              finishSession(prev, e, s);
              return s;
            });
            return e;
          });
        }
        return prev;
      });

      // Simulate energy delivery
      setEnergyDelivered((prev) => {
        const rate = calculation.powerAvailable / 3600; // kWh per second
        return Math.min(totalEnergyNeeded, prev + rate);
      });

      // Simulate power fluctuation
      setCurrentPower((prev) => {
        const fluctuation = (Math.random() - 0.5) * 4;
        const next = Math.max(
          calculation.powerAvailable * 0.85,
          Math.min(calculation.powerAvailable, prev + fluctuation)
        );
        setPowerHistory((ph) => {
          const newPoint = { time: ph.length, power: Math.round(next) };
          return [...ph.slice(-29), newPoint];
        });
        return next;
      });

      // Simulate temperature
      setTemperature((prev) => {
        const drift = (Math.random() - 0.3) * 0.2;
        return Math.min(45, Math.max(25, prev + drift));
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    targetBattery,
    calculation.powerAvailable,
    totalEnergyNeeded,
    finishSession,
    onCarChargeUpdate,
  ]);

  const handlePause = () => {
    setPaused((p) => !p);
    onPause();
  };

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const costSoFar = energyDelivered * session.costPerKwh;
    const finalSession: ChargeSession = {
      ...session,
      endBattery: Math.round(currentBattery),
      energyUsed: Math.round(energyDelivered * 10) / 10,
      totalCost: Math.round(costSoFar * 100) / 100,
      duration: Math.round(elapsedSeconds / 60),
      status: 'cancelled',
    };
    onStop(finalSession);
  };

  const costSoFar = energyDelivered * session.costPerKwh;

  return (
    <div className="space-y-5 animate-[fade-in_0.4s_ease-out]">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span
            className={`transition-opacity duration-300 ${boltPulse ? 'opacity-100' : 'opacity-40'}`}
          >
            <Zap size={22} className="text-[#1E90FF]" fill="#1E90FF" />
          </span>
          <h2 className="text-xl font-bold text-[#F5F5F5]">
            {paused ? 'Pausado' : 'Carregando...'}
          </h2>
          <span
            className={`transition-opacity duration-300 ${boltPulse ? 'opacity-40' : 'opacity-100'}`}
          >
            <Zap size={22} className="text-[#1E90FF]" fill="#1E90FF" />
          </span>
        </div>
        <p className="text-[#A0A0A0] text-sm">{car.model}</p>
      </div>

      {/* ===== FOCAL POINT: bola gigante com stats orbitando ===== */}
      <div className="relative w-full aspect-square max-w-[420px] mx-auto flex items-center justify-center">
        {/* Bateria — canto superior esquerdo */}
        <OrbitStat
          className="absolute top-[6%] left-0"
          align="left"
          icon={<Battery size={14} className="text-[#1E90FF]" />}
          label="Bateria"
          value={`${Math.round(currentBattery)}%`}
        />

        {/* Custo — canto superior direito */}
        <OrbitStat
          className="absolute top-[6%] right-0"
          align="right"
          icon={<TrendingUp size={14} className="text-[#00D084]" />}
          label="Custo"
          value={formatCurrency(costSoFar)}
          valueColor="text-[#00D084]"
        />

        {/* Círculo gigante, sem moldura */}
        <CircularProgress
          percentage={currentBattery}
          size={260}
          strokeWidth={16}
          color="#1E90FF"
          animate
        />

        {/* Início — canto inferior esquerdo */}
        <OrbitStat
          className="absolute bottom-[6%] left-0"
          align="left"
          icon={<Flag size={14} className="text-[#A0A0A0]" />}
          label="Início"
          value={`${session.startBattery}%`}
        />

        {/* Tempo — canto inferior direito */}
        <OrbitStat
          className="absolute bottom-[6%] right-0"
          align="right"
          icon={<Clock size={14} className="text-amber-400" />}
          label="Tempo"
          value={formatTime(Math.round(remainingSeconds / 60))}
        />
      </div>

      {/* Potência + Temperatura — linha discreta logo abaixo do foco */}
      <div className="grid grid-cols-2 gap-3 max-w-[420px] mx-auto">
        <LiveStat
          icon={<Zap size={15} className="text-[#00D084]" />}
          label="Potência atual"
          value={`${Math.round(currentPower)} kW`}
          highlight
        />
        <LiveStat
          icon={<Thermometer size={15} className="text-[#FF6B35]" />}
          label="Temperatura"
          value={`${temperature.toFixed(1)}°C`}
        />
      </div>

      {/* Power chart */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-[#1E90FF]" />
          <span className="text-sm font-semibold text-[#F5F5F5]">Potência em tempo real</span>
        </div>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={powerHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E90FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1E90FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#6A6A6A', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2E2E2E',
                  border: '1px solid #3A3A3A',
                  borderRadius: '8px',
                  color: '#F5F5F5',
                  fontSize: '12px',
                  fontFamily: 'IBM Plex Mono',
                }}
                formatter={(val) => [`${val} kW`, 'Potência']}
                labelFormatter={() => ''}
              />
              <Area
                type="monotone"
                dataKey="power"
                stroke="#1E90FF"
                strokeWidth={2}
                fill="url(#powerGradient)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          id="pause-btn"
          variant={paused ? 'success' : 'secondary'}
          size="lg"
          fullWidth
          onClick={handlePause}
          icon={paused ? <Zap size={18} /> : <Pause size={18} />}
        >
          {paused ? 'Retomar' : 'Pausar'}
        </Button>
        <Button
          id="stop-btn"
          variant="danger"
          size="lg"
          fullWidth
          onClick={handleStop}
          icon={<Square size={18} />}
        >
          Encerrar
        </Button>
      </div>
    </div>
  );
};

/**
 * Stat "orbitando" ao redor do círculo grande — sem card, sem borda.
 * Apenas ícone + label + valor, alinhado à esquerda ou direita.
 */
const OrbitStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  align: 'left' | 'right';
  valueColor?: string;
  className?: string;
}> = ({ icon, label, value, align, valueColor = 'text-[#F5F5F5]', className = '' }) => (
  <div
    className={`flex flex-col gap-0.5 ${align === 'right' ? 'items-end text-right' : 'items-start text-left'} ${className}`}
  >
    <div className={`flex items-center gap-1.5 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      {icon}
      <span className="text-[11px] uppercase tracking-wide text-[#6A6A6A]">{label}</span>
    </div>
    <span className={`mono font-bold text-lg leading-none ${valueColor}`}>{value}</span>
  </div>
);

const LiveStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}> = ({ icon, label, value, sub, highlight = false }) => (
  <Card className="text-center">
    <div className="flex items-center justify-center gap-1.5 mb-1">
      {icon}
      <span className="text-xs text-[#6A6A6A]">{label}</span>
    </div>
    <div className={`mono font-bold text-base ${highlight ? 'text-[#00D084]' : 'text-[#F5F5F5]'}`}>
      {value}
    </div>
    {sub && <div className="text-xs text-[#6A6A6A] mt-0.5">{sub}</div>}
  </Card>
);
