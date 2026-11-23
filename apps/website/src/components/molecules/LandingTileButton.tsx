import { memo } from 'react';
import GlassSlab from '../atoms/GlassSlab';

export interface LandingTileButtonProps {
  readonly label: string;
  readonly onClick: () => void;
}

const LandingTileButton = memo(function LandingTileButton({
  label,
  onClick,
}: LandingTileButtonProps) {
  return (
    <GlassSlab layer={1} className="landing-tilt-wrapper">
      <button
        type="button"
        className="landing-square-btn depth-layer-2"
        onClick={onClick}
      >
        <span className="landing-btn-label">{label}</span>
      </button>
    </GlassSlab>
  );
});

export default LandingTileButton;
