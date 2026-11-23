import { memo } from 'react';

export interface PeriodBadgeProps {
  readonly text: string;
  readonly variant?: 'period' | 'count';
}

const PeriodBadge = memo(function PeriodBadge({
  text,
  variant = 'period',
}: PeriodBadgeProps) {
  const baseClass = variant === 'count' ? 'section-count' : 'period-badge';
  return <span className={`${baseClass} depth-layer-3`}>{text}</span>;
});

export default PeriodBadge;
