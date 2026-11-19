import { memo } from 'react';

export interface MonogramBadgeProps {
  readonly text: string;
}

const MonogramBadge = memo(function MonogramBadge({ text }: MonogramBadgeProps) {
  return (
    <span className="topbar-monogram depth-layer-3" aria-hidden="true">
      {text}
    </span>
  );
});

export default MonogramBadge;
