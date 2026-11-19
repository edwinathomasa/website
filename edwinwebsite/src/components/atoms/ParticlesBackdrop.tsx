import { Beams } from '@/components/ui/beams';
import { memo } from 'react';

const BEAM_COLORS = [
  '#67e8f9',
  '#6d5cff',
  '#d946ef',
  '#FC0B1C',
  '#0A66C2',
  '#0A66C2',
] as const;

const ParticlesBackdrop = memo(function ParticlesBackdrop() {
  return (
    <div className="particles-backdrop depth-bg" aria-hidden="true">
      <Beams
        className="min-h-[32rem]"
        angle={-1}
        colors={BEAM_COLORS}
        count={68}
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
