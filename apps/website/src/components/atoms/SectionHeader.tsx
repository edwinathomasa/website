import { memo, type ReactNode } from 'react';
import PeriodBadge from './PeriodBadge';

export interface SectionHeaderProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly countText?: string;
}

const SectionHeader = memo(function SectionHeader({
  icon,
  title,
  countText,
}: SectionHeaderProps) {
  return (
    <header className="section-header">
      <span className="section-icon" aria-hidden="true">
        {icon}
      </span>
      <h2 className="section-title">{title}</h2>
      {countText && <PeriodBadge text={countText} variant="count" />}
    </header>
  );
});

export default SectionHeader;
