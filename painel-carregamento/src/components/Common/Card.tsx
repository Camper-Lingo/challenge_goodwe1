// src/components/Common/Card.tsx

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'blue' | 'green' | 'orange' | 'none';
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  onClick,
  hoverable = false,
}) => {
  const glowStyles: Record<string, string> = {
    blue: 'shadow-lg shadow-blue-500/10 border-blue-500/20',
    green: 'shadow-lg shadow-green-500/10 border-green-500/20',
    orange: 'shadow-lg shadow-orange-500/10 border-orange-500/20',
    none: 'border-[#3A3A3A]',
  };

  const hoverStyle = hoverable || onClick
    ? 'cursor-pointer hover:scale-[1.02] hover:border-[#4A4A4A] hover:shadow-xl transition-all duration-200'
    : '';

  return (
    <div
      className={`bg-[#2E2E2E] rounded-2xl border p-5 transition-all duration-200 ${glowStyles[glow]} ${hoverStyle} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
