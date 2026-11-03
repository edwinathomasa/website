interface ChipProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'skill' | 'prompt';
}

function Chip({ label, onClick, disabled = false, variant = 'skill' }: ChipProps) {
  const className = variant === 'prompt' ? 'ai-prompt-chip' : 'skill-chip';

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </button>
    );
  }

  return <span className={className}>{label}</span>;
}

export default Chip;
