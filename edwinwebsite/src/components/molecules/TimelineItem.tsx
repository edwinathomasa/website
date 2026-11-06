import type { ReactNode } from 'react';

interface TimelineItemProps {
  readonly title: string;
  readonly subtitle?: ReactNode;
  readonly description?: string;
  readonly highlights?: readonly string[];
  readonly footer?: ReactNode;
}

function TimelineItem({
  title,
  subtitle,
  description,
  highlights,
  footer,
}: TimelineItemProps) {
  return (
    <div className="timeline-item">
      <h3 className="timeline-title">{title}</h3>
      {subtitle && <p className="timeline-subtitle">{subtitle}</p>}
      {description && <p className="timeline-description">{description}</p>}
      {highlights && highlights.length > 0 && (
        <ul className="timeline-highlights">
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {footer}
    </div>
  );
}

export default TimelineItem;
