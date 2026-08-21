// src/components/Common/CircularProgress.tsx

import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  animate?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 160,
  strokeWidth = 12,
  color = '#1E90FF',
  trackColor = '#3A3A3A',
  label,
  sublabel,
  animate = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, percentage));
  const dashOffset = circumference - (pct / 100) * circumference;

  // Color based on percentage
  const dynamicColor =
    pct < 20 ? '#FF6B35' : pct < 50 ? '#FFB800' : color;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={dynamicColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: animate ? 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease' : 'none',
            filter: `drop-shadow(0 0 6px ${dynamicColor}80)`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label !== undefined ? (
          <>
            <span className="mono font-bold text-[#F5F5F5]" style={{ fontSize: size * 0.18 }}>
              {label}
            </span>
            {sublabel && (
              <span className="text-[#A0A0A0] font-medium" style={{ fontSize: size * 0.09 }}>
                {sublabel}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="mono font-bold text-[#F5F5F5]" style={{ fontSize: size * 0.18 }}>
              {Math.round(pct)}%
            </span>
            <span className="text-[#A0A0A0] font-medium" style={{ fontSize: size * 0.09 }}>
              bateria
            </span>
          </>
        )}
      </div>
    </div>
  );
};
