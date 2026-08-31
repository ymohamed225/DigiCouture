import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 14,
  borderRadius = 6,
  style,
}) => (
  <div style={{
    width,
    height,
    borderRadius,
    background: 'linear-gradient(90deg, #1a1a20 25%, #26262e 50%, #1a1a20 75%)',
    backgroundSize: '200% 100%',
    animation: 'adminShimmer 1.5s infinite',
    ...style,
  }} />
);

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, cols = 5 }) => (
  <div style={{ padding: '0 24px 24px' }}>
    {/* Header */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 16,
      padding: '16px 0',
      borderBottom: '1px solid #24242A',
    }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} width="60%" height={11} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 16,
        padding: '14px 0',
        borderBottom: '1px solid #1a1a20',
        alignItems: 'center',
      }}>
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} width={c === 0 ? '80%' : `${50 + Math.random() * 30}%`} height={12} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonKpis: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(200px, 1fr))`,
    gap: 16,
  }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        background: '#121216',
        border: '1px solid #24242A',
        borderRadius: 14,
        padding: '20px 22px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton width="55%" height={11} />
          <Skeleton width={38} height={38} borderRadius={10} />
        </div>
        <Skeleton width="45%" height={28} style={{ marginTop: 16 }} />
        <Skeleton width="60%" height={11} style={{ marginTop: 12 }} />
      </div>
    ))}
  </div>
);
