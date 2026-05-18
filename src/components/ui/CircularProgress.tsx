import React from 'react';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  animate?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 120,
  strokeWidth = 10,
  color = '#10b981',
  trackColor = 'rgba(255,255,255,0.08)',
  label,
  sublabel,
  animate = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="circular-progress-wrapper" style={{ width: size, height: size, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: animate ? 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' : 'none' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}>
        {label !== undefined && (
          <span style={{ fontSize: size * 0.18, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{label}</span>
        )}
        {sublabel && (
          <span style={{ fontSize: size * 0.11, color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>{sublabel}</span>
        )}
      </div>
    </div>
  );
};

export default CircularProgress;
