// src/components/Screens/HistoryScreen.tsx

import React, { useState, useMemo } from 'react';
import { History, Calendar, Zap, Battery, DollarSign, Clock, CheckCircle, XCircle, Trash2, ChevronDown } from 'lucide-react';
import type { ChargeSession } from '../../types';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import { formatCurrency, formatEnergy, formatTime, formatDateFull } from '../../utils/formatters';

interface HistoryScreenProps {
  history: ChargeSession[];
  onClearHistory: () => void;
  onBack: () => void;
}

type FilterDays = 7 | 30 | 90 | 'all';

const FILTERS: { label: string; value: FilterDays }[] = [
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
  { label: '90 dias', value: 90 },
  { label: 'Todos', value: 'all' },
];

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  onClearHistory,
}) => {
  const [filterDays, setFilterDays] = useState<FilterDays>(30);
  const [showAll, setShowAll] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = useMemo(() => {
    if (filterDays === 'all') return history;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - filterDays);
    return history.filter((s) => new Date(s.timestamp) >= cutoff);
  }, [history, filterDays]);

  const visible = showAll ? filtered : filtered.slice(0, 5);

  // Aggregate stats
  const totalCost = filtered.reduce((acc, s) => acc + s.totalCost, 0);
  const totalEnergy = filtered.reduce((acc, s) => acc + s.energyUsed, 0);
  const totalTime = filtered.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="space-y-4 animate-[fade-in_0.4s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2E2E2E] border border-[#3A3A3A] flex items-center justify-center">
            <History size={18} className="text-[#1E90FF]" />
          </div>
          <div>
            <h2 className="font-bold text-[#F5F5F5] text-lg">Histórico</h2>
            <p className="text-[#A0A0A0] text-sm">{filtered.length} sessão(ões)</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            id="clear-history-btn"
            onClick={() => setShowClearConfirm(true)}
            className="w-10 h-10 rounded-xl bg-[#2E2E2E] border border-[#3A3A3A] flex items-center justify-center text-[#6A6A6A] hover:text-[#FF6B35] hover:border-[#FF6B35]/30 transition-all"
            title="Limpar histórico"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            id={`filter-${f.value}`}
            onClick={() => { setFilterDays(f.value); setShowAll(false); }}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${filterDays === f.value
                ? 'bg-[#1E90FF] text-white shadow-lg shadow-blue-500/20'
                : 'bg-[#2E2E2E] text-[#A0A0A0] border border-[#3A3A3A] hover:bg-[#3A3A3A]'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Aggregate stats */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <AggregateStat
            icon={<DollarSign size={14} className="text-[#00D084]" />}
            label="Total gasto"
            value={formatCurrency(totalCost)}
            color="green"
          />
          <AggregateStat
            icon={<Zap size={14} className="text-[#1E90FF]" />}
            label="Energia total"
            value={formatEnergy(totalEnergy)}
            color="blue"
          />
          <AggregateStat
            icon={<Clock size={14} className="text-amber-400" />}
            label="Tempo total"
            value={formatTime(totalTime)}
            color="amber"
          />
        </div>
      )}

      {/* Session list */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar size={40} className="text-[#3A3A3A] mx-auto mb-3" />
          <p className="text-[#A0A0A0]">Nenhum carregamento no período selecionado</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}

          {filtered.length > 5 && !showAll && (
            <button
              id="show-more-btn"
              onClick={() => setShowAll(true)}
              className="w-full py-3 text-sm text-[#A0A0A0] hover:text-[#F5F5F5] flex items-center justify-center gap-1 transition-colors"
            >
              Ver todos ({filtered.length - 5} restantes)
              <ChevronDown size={14} />
            </button>
          )}
        </div>
      )}

      {/* Clear confirm dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <Card className="w-full max-w-sm animate-[slide-up_0.35s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-[#FF6B35]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 size={24} className="text-[#FF6B35]" />
              </div>
              <h3 className="font-bold text-[#F5F5F5] text-lg">Limpar histórico?</h3>
              <p className="text-[#A0A0A0] text-sm mt-1">
                Esta ação é irreversível. Todos os {history.length} registros serão excluídos.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                id="cancel-clear-btn"
                variant="secondary"
                fullWidth
                onClick={() => setShowClearConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                id="confirm-clear-btn"
                variant="danger"
                fullWidth
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
              >
                Limpar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const SessionCard: React.FC<{ session: ChargeSession }> = ({ session }) => {
  const isCompleted = session.status === 'completed';
  const delta = session.endBattery - session.startBattery;

  return (
    <Card hoverable className="animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-[#00D084]' : 'bg-[#FF6B35]'}`} />
            <span className="text-xs text-[#A0A0A0]">{formatDateFull(session.timestamp)}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="mono font-bold text-[#F5F5F5]">
              {session.startBattery}% → {session.endBattery}%
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
              ${isCompleted
                ? 'bg-[#00D084]/20 text-[#00D084]'
                : 'bg-[#FF6B35]/20 text-[#FF6B35]'
              }`}
            >
              {isCompleted ? '✓ Completo' : '✕ Cancelado'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="mono font-bold text-[#00D084] text-lg">
            {formatCurrency(session.totalCost)}
          </div>
          <div className="text-xs text-[#6A6A6A]">{formatEnergy(session.energyUsed)}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[#3A3A3A]">
        <MiniStat
          icon={<Battery size={12} className="text-[#1E90FF]" />}
          value={`+${delta}%`}
        />
        <MiniStat
          icon={<Zap size={12} className="text-[#A0A0A0]" />}
          value={formatEnergy(session.energyUsed)}
        />
        <MiniStat
          icon={<Clock size={12} className="text-amber-400" />}
          value={formatTime(session.duration)}
        />
        <MiniStat
          icon={isCompleted
            ? <CheckCircle size={12} className="text-[#00D084]" />
            : <XCircle size={12} className="text-[#FF6B35]" />
          }
          value={session.stationId}
        />
      </div>
    </Card>
  );
};

const MiniStat: React.FC<{ icon: React.ReactNode; value: string }> = ({ icon, value }) => (
  <div className="flex items-center gap-1">
    {icon}
    <span className="mono text-xs text-[#A0A0A0]">{value}</span>
  </div>
);

const AggregateStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'amber';
}> = ({ icon, label, value, color }) => {
  const bg = {
    blue: 'bg-[#1E90FF]/10',
    green: 'bg-[#00D084]/10',
    amber: 'bg-amber-500/10',
  }[color];

  return (
    <div className={`${bg} rounded-xl p-3 text-center`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className="text-xs text-[#6A6A6A]">{label}</span>
      </div>
      <div className="mono font-bold text-[#F5F5F5] text-sm">{value}</div>
    </div>
  );
};
