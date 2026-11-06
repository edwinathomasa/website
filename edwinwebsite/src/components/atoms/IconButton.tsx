import type { ReactNode } from 'react';

interface IconButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
}

function IconButton({
  onClick,
  type = 'button',
  disabled = false,
  ariaLabel,
  className,
  children,
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

export default IconButton;
