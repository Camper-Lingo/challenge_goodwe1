// src/components/Screens/ConfirmScreen.tsx

import React from 'react';
import { ArrowLeft, Zap, Battery, Clock, DollarSign, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Car, ChargeCalculation } from '../../types';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import { formatCurrency, formatTime, formatEnergy } from '../../utils/formatters';

interface ConfirmScreenProps {
  car: Car;
  targetBattery: number;
  calculation: ChargeCalculation;
  stationId: string;
  onBack: () => void;
  onConfirm: () => void;
}

export const ConfirmScreen: React.FC<ConfirmScreenProps> = ({
  car,
  targetBattery,
  calculation,
  stationId,
  onBack,
  onConfirm,
}) => {
  const delta = targetBattery - car.currentCharge;

  return (
    <div className="space-y-4 animate-[fade-in_0.4s_ease-out]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          id="back-to-select"
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-[#2E2E2E] border border-[#3A3A3A] flex items-center justify-center text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#3A3A3A] transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="font-bold text-[#F5F5F5] text-lg">Resumo do Carregamento</h2>
          <p className="text-[#A0A0A0] text-sm">{car.model}</p>
        </div>
      </div>

      {/* Battery visual */}
      <Card glow="blue">
        <div className="flex items-center justify-center gap-4 py-3">
          {/* Start */}
          <div className="text-center">
            <div className="mono text-4xl font-bold text-[#A0A0A0]">{car.currentCharge}%</div>
            <div className="text-xs text-[#6A6A6A] mt-1">Atual</div>
          </div>
          {/* Arrow with delta */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 bg-[#1E90FF]/20 text-[#1E90FF] px-3 py-1 rounded-full text-sm font-bold">
              <Zap size={14} fill="#1E90FF" />
              +{delta}%
            </div>
            <ArrowRight size={24} className="text-[#1E90FF]" />
          </div>
          {/* End */}
          <div className="text-center">
            <div className="mono text-4xl font-bold text-[#1E90FF]">{targetBattery}%</div>
            <div className="text-xs text-[#6A6A6A] mt-1">Destino</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-[#3A3A3A] rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1E90FF]/40 to-[#1E90FF] rounded-full transition-all duration-500"
            style={{ width: `${targetBattery}%` }}
          />
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Battery size={20} className="text-[#1E90FF]" />}
          label="Energia"
          value={formatEnergy(calculation.energyNeeded)}
          color="blue"
        />
        <StatCard
          icon={<Clock size={20} className="text-amber-400" />}
          label="Tempo est."
          value={formatTime(calculation.estimatedTime)}
          color="amber"
        />
        <StatCard
          icon={<DollarSign size={20} className="text-[#00D084]" />}
          label="Custo total"
          value={formatCurrency(calculation.totalCostRaw)}
          color="green"
        />
      </div>

      {/* Details */}
      <Card>
        <h3 className="text-sm font-semibold text-[#F5F5F5] mb-3">Detalhes técnicos</h3>
        <div className="space-y-2.5">
          <DetailRow
            icon={<Zap size={14} className="text-[#1E90FF]" />}
            label="Velocidade de carga"
            value={`${calculation.powerAvailable} kW`}
          />
          <DetailRow
            icon={<MapPin size={14} className="text-[#A0A0A0]" />}
            label="Estação"
            value={stationId}
          />
          <DetailRow
            icon={<Battery size={14} className="text-[#A0A0A0]" />}
            label="Tarifa aplicada"
            value={`R$ 0,80/kWh`}
          />
          <DetailRow
            icon={<AlertTriangle size={14} className="text-amber-400" />}
            label="Perda do sistema"
            value={`${calculation.systemLoss}%`}
          />
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 px-1">
        <AlertTriangle size={14} className="text-[#6A6A6A] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#6A6A6A]">
          Valores estimados. O custo real pode variar conforme variações na rede elétrica.
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          id="cancel-btn"
          variant="secondary"
          size="lg"
          fullWidth
          onClick={onBack}
        >
          Cancelar
        </Button>
        <Button
          id="confirm-charge-btn"
          variant="primary"
          size="lg"
          fullWidth
          onClick={onConfirm}
          icon={<Zap size={18} fill="white" />}
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'amber';
}> = ({ icon, label, value, color }) => {
  const bgColor = {
    blue: 'bg-[#1E90FF]/10 border-[#1E90FF]/20',
    green: 'bg-[#00D084]/10 border-[#00D084]/20',
    amber: 'bg-amber-500/10 border-amber-500/20',
  }[color];

  return (
    <div className={`rounded-2xl border p-4 text-center ${bgColor}`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="mono font-bold text-[#F5F5F5] text-sm leading-tight">{value}</div>
      <div className="text-xs text-[#6A6A6A] mt-0.5">{label}</div>
    </div>
  );
};

const DetailRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2">
    <span className="flex-shrink-0">{icon}</span>
    <span className="text-sm text-[#A0A0A0] flex-1">{label}</span>
    <span className="mono text-sm font-semibold text-[#F5F5F5]">{value}</span>
  </div>
);
