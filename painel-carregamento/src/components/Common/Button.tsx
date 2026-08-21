// src/components/Common/Button.tsx

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  icon,
  fullWidth = false,
  ...props
}) => {
  const base =
    'relative font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 select-none active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';

  const variants: Record<string, string> = {
    primary:
      'bg-[#1E90FF] text-white hover:bg-[#1570CD] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40',
    secondary:
      'bg-[#2E2E2E] text-[#F5F5F5] border border-[#3A3A3A] hover:bg-[#3A3A3A] hover:border-[#4A4A4A]',
    danger:
      'bg-[#FF6B35] text-white hover:bg-[#E05520] shadow-lg shadow-orange-500/20',
    success:
      'bg-[#00D084] text-[#1A1A1A] hover:bg-[#00A669] shadow-lg shadow-green-500/20',
    ghost:
      'bg-transparent text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#2E2E2E]',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-2 text-sm min-h-9',
    md: 'px-5 py-3 text-base min-h-12',
    lg: 'px-7 py-4 text-lg min-h-14',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Aguarde...
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
