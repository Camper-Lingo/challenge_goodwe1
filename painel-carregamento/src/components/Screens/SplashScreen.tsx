// src/components/Screens/SplashScreen.tsx

import React, { useEffect } from 'react';



interface SplashScreenProps {
  onLoadingComplete: () => void;
  duration?: number; // em ms
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onLoadingComplete, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onLoadingComplete, duration);
    return () => clearTimeout(timer);
  }, [onLoadingComplete, duration]);

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-20"
          style={{
            background: '#1E90FF',
            animation: 'blob 7s infinite',
          }}
        />
        <div
          className="absolute top-40 right-10 w-72 h-72 rounded-full blur-3xl opacity-20"
          style={{
            background: '#00D084',
            animation: 'blob 7s infinite',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute -bottom-8 left-20 w-72 h-72 rounded-full blur-3xl opacity-15"
          style={{
            background: '#8B5CF6',
            animation: 'blob 7s infinite',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* GoodWe Logo */}
        <div className="relative w-56 h-56 flex items-center justify-center">
         <div className="w-44 h-44 flex items-center justify-center">
          <img
            src="/logo_goodwe.png"
            alt="GoodWe"
            className="w-full h-full object-contain"
          />
        </div>

          {/* Spinning ring */}
          <div
            className="absolute inset-0"
            style={{ animation: 'spin 3s linear infinite' }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-transparent"
              style={{ borderTopColor: '#1E90FF', borderRightColor: '#00D084' }}
            />
          </div>

          {/* Inner pulsing ring */}
          <div className="absolute inset-4">
            <div
              className="w-full h-full rounded-full border-2 border-[#00D084]"
              style={{ opacity: 0.3, animation: 'pulse 2s ease-in-out infinite' }}
            />
          </div>
        </div>

        {/* Text */}
        <div className="text-center" style={{ animation: 'splashFadeIn 0.6s ease-out forwards' }}>
          <h1 className="text-4xl font-bold text-[#F5F5F5] mb-2">GoodWe</h1>
          <p className="text-[#00D084] text-lg font-semibold">Soluções em Energia</p>
        </div>

        {/* Loading bar */}
        <div className="mt-4 w-64">
          <div className="bg-[#3A3A3A] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #1E90FF, #00D084, #1E90FF)',
                animation: `loadingBar ${(duration / 1000) - 0.5}s ease-in-out forwards`,
              }}
            />
          </div>
          <p
            className="text-[#6A6A6A] text-sm text-center mt-3"
            style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
          >
            Inicializando...
          </p>
        </div>

        {/* Tagline */}
        <p
          className="text-[#6A6A6A] text-center text-sm max-w-xs"
          style={{ animation: 'splashFadeIn 0.6s ease-out 0.6s forwards', opacity: 0 }}
        >
          ⚡ Gerenciando sua energia de forma inteligente
        </p>
      </div>

      <style>{`
        @keyframes loadingBar {
          0%   { width: 0%;   opacity: 0; }
          10%  { opacity: 1; }
          100% { width: 100%; opacity: 1; }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -50px) scale(1.1); }
          66%       { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes splashFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
