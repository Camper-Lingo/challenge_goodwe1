// src/components/Screens/DashboardScreen.tsx

import React from 'react';
import { Zap, Battery, Thermometer, TrendingUp, Clock, Wifi, ChevronRight } from 'lucide-react';
import type { Car, Tariff } from '../../types';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import { CircularProgress } from '../Common/CircularProgress';
import { formatCurrency } from '../../utils/formatters';

interface DashboardScreenProps {
  car: Car | null;
  tariff: Tariff;
  onChargeClick: () => void;
  onHistoryClick: () => void;
  onConnectCar: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  car,
  tariff,
  onChargeClick,
  onHistoryClick,
  onConnectCar,
}) => {
  if (!car) {
    return (
      <div className="animate-[fade-in_0.4s_ease-out] space-y-4">
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-[#3A3A3A] rounded-full flex items-center justify-center mx-auto mb-4">
            <Battery size={40} className="text-[#6A6A6A]" />
          </div>
          <h2 className="text-xl font-bold text-[#F5F5F5] mb-2">Nenhum veículo conectado</h2>
          <p className="text-[#A0A0A0] text-sm mb-6">
            Conecte um veículo elétrico para começar o carregamento
          </p>
          <Button id="connect-car-btn" onClick={onConnectCar} size="lg">
            <Zap size={18} />
            Conectar Veículo
          </Button>
        </Card>
      </div>
    );
  }

  const chargeKwh = (car.batteryCapacity * car.currentCharge) / 100;

  return (
    <div className="space-y-4 animate-[fade-in_0.4s_ease-out]">
      {/* Car Status Card */}
      <Card glow="blue" className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#1E90FF]/5 rounded-full -translate-y-20 translate-x-20" />

        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
              <span className="text-xs font-medium text-[#00D084] uppercase tracking-wider">
                Conectado
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#F5F5F5]">{car.model}</h2>
            <p className="text-[#A0A0A0] text-sm">
              Placa: {car.licensePlate}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <CircularProgress
              percentage={car.currentCharge}
              size={110}
              strokeWidth={10}
              color="#1E90FF"
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox
            icon={<Battery size={16} className="text-[#1E90FF]" />}
            label="Carga atual"
            value={`${chargeKwh.toFixed(1)} kWh`}
          />
          <StatBox
            icon={<Zap size={16} className="text-[#00D084]" />}
            label="Potência máx."
            value={`${car.maxPower} kW`}
          />
          {car.temperature ? (
            <StatBox
              icon={<Thermometer size={16} className="text-[#FF6B35]" />}
              label="Temperatura"
              value={`${car.temperature}°C`}
            />
          ) : (
            <StatBox
              icon={<Battery size={16} className="text-[#A0A0A0]" />}
              label="Capacidade"
              value={`${car.batteryCapacity} kWh`}
            />
          )}
        </div>
      </Card>

      {/* Network Status */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Wifi size={16} className="text-[#1E90FF]" />
          <h3 className="font-semibold text-[#F5F5F5]">Status da Rede</h3>
          <span className="ml-auto flex items-center gap-1 text-xs text-[#00D084]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] animate-pulse" />
            Online
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <NetworkStat
            icon={<TrendingUp size={14} className="text-[#00D084]" />}
            label="Tarifa atual"
            value={`${formatCurrency(tariff.currentRate)}/kWh`}
            highlight
          />
          <NetworkStat
            icon={<Zap size={14} className="text-[#1E90FF]" />}
            label="Disponível"
            value="450 kW"
          />
          <NetworkStat
            icon={<Clock size={14} className="text-[#A0A0A0]" />}
            label="Espera"
            value="0 min"
          />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          id="history-btn"
          variant="secondary"
          size="lg"
          onClick={onHistoryClick}
          fullWidth
          icon={<ChevronRight size={16} />}
        >
          Histórico
        </Button>
        <Button
          id="start-charge-btn"
          variant="primary"
          size="lg"
          onClick={onChargeClick}
          fullWidth
          icon={<Zap size={18} fill="white" />}
        >
          Carregar
        </Button>
      </div>
    </div>
  );
};

const StatBox: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="bg-[#242424] rounded-xl p-3">
    <div className="flex items-center gap-1.5 mb-1">
      {icon}
      <span className="text-xs text-[#A0A0A0]">{label}</span>
    </div>
    <div className="mono font-bold text-[#F5F5F5] text-sm">{value}</div>
  </div>
);

const NetworkStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ icon, label, value, highlight = false }) => (
  <div className="text-center">
    <div className="flex items-center justify-center gap-1 mb-1">
      {icon}
      <span className="text-xs text-[#6A6A6A]">{label}</span>
    </div>
    <div className={`mono font-bold text-sm ${highlight ? 'text-[#00D084]' : 'text-[#F5F5F5]'}`}>
      {value}
    </div>
  </div>
);
