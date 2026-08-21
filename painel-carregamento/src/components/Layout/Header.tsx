// src/components/Layout/Header.tsx

import React from 'react';
import { Zap, Settings, History, LayoutDashboard } from 'lucide-react';
import type { Screen } from '../../types';

interface HeaderProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  stationId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  stationId = 'SP-001',
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#1A1A1A]/90 backdrop-blur-md border-b border-[#3A3A3A]">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 group"
          id="logo-btn"
        >
          <div className="w-9 h-9 bg-[#1E90FF] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-[#F5F5F5] text-sm leading-tight">EV Station</div>
            <div className="text-[#A0A0A0] text-xs">Estação {stationId}</div>
          </div>
        </button>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <NavBtn
            id="nav-dashboard"
            icon={<LayoutDashboard size={16} />}
            label="Painel"
            active={currentScreen === 'dashboard'}
            onClick={() => onNavigate('dashboard')}
          />
          <NavBtn
            id="nav-history"
            icon={<History size={16} />}
            label="Histórico"
            active={currentScreen === 'history'}
            onClick={() => onNavigate('history')}
          />
          <NavBtn
            id="nav-settings"
            icon={<Settings size={16} />}
            label=""
            active={false}
            onClick={() => {}}
            title="Configurações"
          />
        </nav>
      </div>
    </header>
  );
};

interface NavBtnProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  title?: string;
}

const NavBtn: React.FC<NavBtnProps> = ({ id, icon, label, active, onClick, title }) => (
  <button
    id={id}
    title={title || label}
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
      ${active
        ? 'bg-[#1E90FF]/20 text-[#1E90FF]'
        : 'text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#2E2E2E]'
      }`}
  >
    {icon}
    {label && <span className="hidden sm:inline">{label}</span>}
  </button>
);
