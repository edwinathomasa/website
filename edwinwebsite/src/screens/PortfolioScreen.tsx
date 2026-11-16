import { memo } from 'react';
import GlassResume from '../components/GlassResume';
import Particles from '../Particles';
import { PortfolioProvider } from '../state/PortfolioContext';

const PARTICLE_COLORS = ['#8C6D53', '#6E6A63', '#22211E'] as const;

export interface PortfolioScreenProps {
  readonly onNavigateBack?: () => void;
}

const PortfolioScreen = memo(function PortfolioScreen({
  onNavigateBack,
}: PortfolioScreenProps) {
  return (
    <PortfolioProvider>
      <div className="screen-container">
        <div className="particles-backdrop depth-bg" aria-hidden="true">
          <Particles
            particleColors={PARTICLE_COLORS}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            glow={0.5}
            twinkle={0.3}
            moveParticlesOnHover={false}
            hoverEffect="parallax"
            sizeRandomness={1}
            shape="circle"
            depthOfField={0}
            connections={false}
            connectionDistance={110}
            particleHoverFactor={1}
            hoverRadius={140}
            drift="none"
            driftSpeed={1}
            alphaParticles={false}
            disableRotation={false}
            cameraDistance={20}
            variation={0}
            opacity={1}
            clickBurst={false}
            intro
            lightMode={false}
          />
        </div>

        <GlassResume onNavigateBack={onNavigateBack} />
      </div>
    </PortfolioProvider>
  );
});

export default PortfolioScreen;
