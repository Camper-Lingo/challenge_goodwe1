// src/components/Screens/WelcomeScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import { User, Zap } from 'lucide-react';
import { Button } from '../Common/Button';

interface WelcomeScreenProps {
  onNameSubmit: (name: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNameSubmit }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!name.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      onNameSubmit(name.trim());
    }, 500);
  };

  const showError = touched && !name.trim();

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: '#00D084', animation: 'blob 7s infinite' }}
        />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: '#1E90FF', animation: 'blob 7s infinite', animationDelay: '2s' }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 w-full max-w-md"
        style={{ animation: 'welcomeFadeIn 0.5s ease-out forwards' }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src="/logo_goodwe.png"
                alt="GoodWe"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-[#F5F5F5]">GoodWe</h1>
          </div>

          <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">
            Bem-vindo! 
          </h2>
          <p className="text-[#A0A0A0]">
            Como você gostaria de ser chamado?
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#2E2E2E] rounded-2xl border border-[#3A3A3A] p-7 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input */}
            <div>
              <label htmlFor="user-name" className="block text-sm text-[#A0A0A0] mb-2 font-medium">
                Seu nome
              </label>
              <div className={`flex items-center bg-[#242424] rounded-xl border-2 px-4 py-3 transition-colors duration-200
                ${showError
                  ? 'border-[#FF6B35]'
                  : name
                  ? 'border-[#00D084]'
                  : 'border-[#3A3A3A] focus-within:border-[#1E90FF]'
                }`}
              >
                <User size={18} className="text-[#6A6A6A] mr-3 flex-shrink-0" />
                <input
                  id="user-name"
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setTouched(false); }}
                  onBlur={() => setTouched(true)}
                  placeholder="Digite seu nome..."
                  disabled={isLoading}
                  maxLength={40}
                  className="flex-1 bg-transparent text-[#F5F5F5] text-lg font-medium outline-none placeholder-[#4A4A4A] disabled:opacity-50"
                />
                {name && (
                  <span className="text-[#00D084] text-lg ml-2">✓</span>
                )}
              </div>
              {showError && (
                <p className="text-[#FF6B35] text-xs mt-1.5">Por favor, digite seu nome para continuar.</p>
              )}
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-[#6A6A6A]">Digite seu nome para continuar</span>
                <span className={`text-xs font-semibold ${name.length > 0 ? 'text-[#00D084]' : 'text-[#6A6A6A]'}`}>
                  {name.length}/40
                </span>
              </div>
            </div>

            {/* Submit */}
            <Button
              id="welcome-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              icon={<Zap size={18} fill="white" />}
            >
              Continuar
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 p-3 bg-[#1E90FF]/10 border border-[#1E90FF]/20 rounded-xl">
            <p className="text-[#1E90FF] text-xs text-center">
              ℹ️ Seu nome será salvo para uma experiência personalizada
            </p>
          </div>
        </div>

        <p className="text-[#6A6A6A] text-sm text-center mt-6">
          Estação de Carregamento GoodWe ⚡
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -50px) scale(1.1); }
          66%       { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes welcomeFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
