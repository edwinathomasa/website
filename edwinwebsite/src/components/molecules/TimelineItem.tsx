import type { ReactNode } from 'react';

interface TimelineItemProps {
  title: string;
  subtitle?: ReactNode;
  description?: string;
  highlights?: string[];
  footer?: ReactNode;
  className?: string;
}

function TimelineItem({
  title,
  subtitle,
  description,
  highlights,
  footer,
  className = 'timeline-item',
}: TimelineItemProps) {
  return (
    <div className={className}>
      <h3 className="timeline-title">{title}</h3>
      {subtitle && <p className="timeline-subtitle">{subtitle}</p>}
      {description && <p className="timeline-description">{description}</p>}
      {highlights && highlights.length > 0 && (
        <ul className="timeline-highlights">
          {highlights.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
      {footer}
    </div>
  );
}

export default TimelineItem;
