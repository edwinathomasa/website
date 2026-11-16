import { memo } from 'react';
import TiltCard from '../components/TiltCard';
import Particles from '../Particles';

const PARTICLE_COLORS = ['#8C6D53', '#6E6A63', '#22211E'] as const;

export interface LandingScreenProps {
  readonly onNavigatePortfolio: () => void;
  readonly onNavigateAi: () => void;
}

const LandingScreen = memo(function LandingScreen({
  onNavigatePortfolio,
  onNavigateAi,
}: LandingScreenProps) {
  return (
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

      <main className="landing-viewport">
        <div className="landing-tiles">
          <TiltCard layer={1} maxTilt={3.8} className="landing-tilt-wrapper">
            <button
              type="button"
              className="landing-square-btn depth-layer-2"
              onClick={onNavigatePortfolio}
            >
              <span className="landing-btn-label">Portfolio</span>
            </button>
          </TiltCard>

          <TiltCard layer={1} maxTilt={3.8} className="landing-tilt-wrapper">
            <button
              type="button"
              className="landing-square-btn depth-layer-2"
              onClick={onNavigateAi}
            >
              <span className="landing-btn-label">AI</span>
            </button>
          </TiltCard>
        </div>
      </main>
    </div>
  );
});

export default LandingScreen;
