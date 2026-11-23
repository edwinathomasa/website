import { memo } from 'react';
import { unlockAudioPlayback } from '../../services/audio/elevenLabsTts';
import LandingTileButton from '../molecules/LandingTileButton';
import LandingTemplate from '../templates/LandingTemplate';

export interface LandingPageProps {
  readonly onNavigatePortfolio: () => void;
  readonly onNavigateAi: () => void;
}

const LandingPage = memo(function LandingPage({
  onNavigatePortfolio,
  onNavigateAi,
}: LandingPageProps) {
  return (
    <LandingTemplate>
      <LandingTileButton label="Portfolio" onClick={onNavigatePortfolio} />
      <LandingTileButton
        label="AI"
        onClick={() => {
          unlockAudioPlayback();
          onNavigateAi();
        }}
      />
    </LandingTemplate>
  );
});

export default LandingPage;
