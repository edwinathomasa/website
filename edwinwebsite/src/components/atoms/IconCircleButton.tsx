import { memo, type ReactNode } from 'react';

export interface IconCircleButtonProps {
  readonly children: ReactNode;
  readonly ariaLabel: string;
  readonly title?: string;
  readonly href?: string;
  readonly onClick?: () => void;
  readonly className?: string;
}

const IconCircleButton = memo(function IconCircleButton({
  children,
  ariaLabel,
  title,
  href,
  onClick,
  className = 'glass-icon-link',
}: IconCircleButtonProps) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} depth-layer-3`.trim()}
        aria-label={ariaLabel}
        title={title}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={`${className} depth-layer-3`.trim()}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
});

export default IconCircleButton;
