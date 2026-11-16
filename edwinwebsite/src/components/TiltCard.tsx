import { memo, type ReactNode } from 'react';

export interface TiltCardProps {
  readonly children: ReactNode;
  readonly layer?: 1 | 2 | 3;
  readonly maxTilt?: number;
  readonly as?: 'section' | 'article' | 'div';
  readonly id?: string;
  readonly className?: string;
}

const TiltCard = memo(function TiltCard({
  children,
  layer = 1,
  as: Tag = 'section',
  id,
  className = '',
}: TiltCardProps) {
  const depthClass = `depth-layer-${layer}`;

  return (
    <Tag id={id} className={`tilt-card ${depthClass} ${className}`.trim()}>
      <div className="tilt-card-content">{children}</div>
    </Tag>
  );
});

export default TiltCard;
