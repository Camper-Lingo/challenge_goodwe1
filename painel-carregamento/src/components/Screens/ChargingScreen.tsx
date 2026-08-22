// src/components/Screens/ChargingScreen.tsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Zap, Battery, Clock, Thermometer, Pause, Square, TrendingUp } from 'lucide-react';
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
import { formatCurrency, formatTime, formatEnergy } from '../../utils/formatters';

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
  const progressPercent = totalEnergyNeeded > 0
    ? Math.min(100, (energyDelivered / totalEnergyNeeded) * 100)
    : 0;

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
    <div className="space-y-4 animate-[fade-in_0.4s_ease-out]">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span
            className={`transition-opacity duration-300 ${boltPulse ? 'opacity-100' : 'opacity-40'}`}
          >
            <Zap size={24} className="text-[#1E90FF]" fill="#1E90FF" />
          </span>
          <h2 className="text-xl font-bold text-[#F5F5F5]">
            {paused ? 'Pausado' : 'Carregando...'}
          </h2>
          <span
            className={`transition-opacity duration-300 ${boltPulse ? 'opacity-40' : 'opacity-100'}`}
          >
            <Zap size={24} className="text-[#1E90FF]" fill="#1E90FF" />
          </span>
        </div>
        <p className="text-[#A0A0A0] text-sm">{car.model}</p>
      </div>

      {/* Main progress */}
      <Card glow="blue" className="flex flex-col items-center py-6">
        <CircularProgress
          percentage={currentBattery}
          size={180}
          strokeWidth={14}
          color="#1E90FF"
          animate
        />
        <div className="mt-4 w-full">
          <div className="flex justify-between text-xs text-[#6A6A6A] mono mb-1">
            <span>{session.startBattery}% inicio</span>
            <span>{targetBattery}% destino</span>
          </div>
          <div className="h-2 bg-[#3A3A3A] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1E90FF] to-[#00D084] rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-center mt-1 text-xs text-[#A0A0A0]">
            {Math.round(progressPercent)}% completo
          </div>
        </div>
      </Card>

      {/* Live stats */}
      <div className="grid grid-cols-2 gap-3">
        <LiveStat
          icon={<Battery size={16} className="text-[#1E90FF]" />}
          label="Energia entregue"
          value={formatEnergy(energyDelivered)}
          sub={`de ${formatEnergy(totalEnergyNeeded)}`}
        />
        <LiveStat
          icon={<Clock size={16} className="text-amber-400" />}
          label="Tempo restante"
          value={formatTime(Math.round(remainingSeconds / 60))}
          sub={`${Math.floor(elapsedSeconds / 60)}min decorridos`}
        />
        <LiveStat
          icon={<Zap size={16} className="text-[#00D084]" />}
          label="Potência atual"
          value={`${Math.round(currentPower)} kW`}
          sub="velocidade"
          highlight
        />
        <LiveStat
          icon={<Thermometer size={16} className="text-[#FF6B35]" />}
          label="Temperatura"
          value={`${temperature.toFixed(1)}°C`}
          sub="bateria"
        />
      </div>

      {/* Cost */}
      <Card glow="green">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#00D084]" />
            <span className="text-sm text-[#A0A0A0]">Custo acumulado</span>
          </div>
          <div className="mono text-2xl font-bold text-[#00D084]">
            {formatCurrency(costSoFar)}
          </div>
        </div>
      </Card>

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
