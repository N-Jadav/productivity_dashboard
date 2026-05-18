import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = '#10b981',
  height = 8,
  showLabel = false,
  animated = true,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        flex: 1,
        height,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: height,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, value)}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: height,
          transition: animated ? 'width 0.8s cubic-bezier(0.4,0,0.2,1)' : 'none',
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', minWidth: 32, textAlign: 'right' }}>
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
