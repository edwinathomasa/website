import { Beams } from '@/components/ui/beams';
import { memo } from 'react';

const BEAM_COLORS = [
  'var(--beam-cyan)',
  'var(--beam-indigo)',
  'var(--beam-fuchsia)',
  'var(--beam-crimson)',
  'var(--beam-cobalt)',
  'var(--beam-cobalt)',
] as const;

const ParticlesBackdrop = memo(function ParticlesBackdrop() {
  return (
    <div className="particles-backdrop depth-bg" aria-hidden="true">
      <Beams
        className="min-h-[32rem]"
        angle={-1}
        colors={BEAM_COLORS}
        count={128}
        curve={1.75}
        fan={0}
        frequency={1.05}
        glow={0}
        interactive={false}
        length={0.38}
        seed={1}
        speed={0.5}
        spread={2.9}
        tracks={0.5}
      />
    </div>
  );
});

export default ParticlesBackdrop;
