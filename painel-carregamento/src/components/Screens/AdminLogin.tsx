import React, { useState } from 'react';
import { Shield, ArrowLeft, Lock } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

const ADMIN_PASSWORD = 'admin123';

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSuccess,
  onBack,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setError('');
      onSuccess();
    } else {
      setError('Senha incorreta.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">

        <div className="bg-[#242424] border border-[#3A3A3A] rounded-2xl p-6">

          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#A0A0A0] hover:text-white mb-6"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <div className="text-center mb-6">

            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#1E90FF]/15 flex items-center justify-center">
              <Shield
                size={28}
                className="text-[#1E90FF]"
              />
            </div>

            <h1 className="text-xl font-bold text-white">
              Acesso Administrativo
            </h1>

            <p className="text-sm text-[#A0A0A0] mt-1">
              Digite a senha para continuar
            </p>

          </div>

          <form onSubmit={handleLogin}>

            <label className="block text-sm text-[#A0A0A0] mb-2">
              Senha
            </label>

            <div className="flex items-center gap-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl px-4 py-3 focus-within:border-[#1E90FF]">

              <Lock
                size={18}
                className="text-[#6A6A6A]"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Digite a senha"
                className="flex-1 bg-transparent outline-none text-white placeholder-[#6A6A6A]"
                autoFocus
              />

            </div>

            {error && (
              <p className="text-sm text-[#FF6B35] mt-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full mt-5 py-3 rounded-xl bg-[#1E90FF] hover:bg-[#1878D1] text-white font-bold transition-all"
            >
              Entrar
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};