import { memo } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import IconCircleButton from '../atoms/IconCircleButton';
import MonogramBadge from '../atoms/MonogramBadge';

export interface TopbarIdentityProps {
  readonly monogram: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly onNavigateBack?: () => void;
}

const TopbarIdentity = memo(function TopbarIdentity({
  monogram,
  title,
  subtitle,
  onNavigateBack,
}: TopbarIdentityProps) {
  return (
    <div className="topbar-identity">
      {onNavigateBack && (
        <IconCircleButton
          onClick={onNavigateBack}
          ariaLabel="Back to home screen"
          title="Back"
        >
          <FaArrowLeft size={14} />
        </IconCircleButton>
      )}
      <MonogramBadge text={monogram} />
      <div className="topbar-text-inline">
        <h1 className="topbar-name">{title}</h1>
        {subtitle && (
          <>
            <span className="topbar-divider" aria-hidden="true">
              ·
            </span>
            <p className="topbar-role">{subtitle}</p>
          </>
        )}
      </div>
    </div>
  );
});

export default TopbarIdentity;
