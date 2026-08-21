// src/components/Common/Toast.tsx

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastData } from '../../types';

interface ToastProps extends ToastData {
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(id), 350);
    }, 3500);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const configs = {
    success: {
      bg: 'bg-[#00D084]',
      text: 'text-[#1A1A1A]',
      icon: <CheckCircle size={18} />,
    },
    error: {
      bg: 'bg-[#FF6B35]',
      text: 'text-white',
      icon: <XCircle size={18} />,
    },
    info: {
      bg: 'bg-[#1E90FF]',
      text: 'text-white',
      icon: <Info size={18} />,
    },
    warning: {
      bg: 'bg-amber-500',
      text: 'text-white',
      icon: <AlertTriangle size={18} />,
    },
  };

  const cfg = configs[type];

  return (
    <div
      className={`${cfg.bg} ${cfg.text} px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-72 max-w-sm
        transition-all duration-350
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <span className="flex-shrink-0">{cfg.icon}</span>
      <span className="font-medium text-sm flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};
