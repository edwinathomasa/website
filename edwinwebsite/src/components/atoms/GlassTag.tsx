import { memo } from 'react';

export interface GlassTagProps {
  readonly label: string;
  readonly variant?: 'default' | 'sm';
}

const GlassTag = memo(function GlassTag({
  label,
  variant = 'default',
}: GlassTagProps) {
  return (
    <span
      className={`glass-tag ${
        variant === 'sm' ? 'glass-tag-sm' : ''
      } depth-layer-3`.trim()}
    >
      {label}
    </span>
  );
});

export default GlassTag;
