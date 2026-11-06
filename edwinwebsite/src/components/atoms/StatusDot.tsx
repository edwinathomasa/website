import type { VoiceState } from '../../types/voice';

interface StatusDotProps {
  state: VoiceState;
}

function StatusDot({ state }: StatusDotProps) {
  return <span className={`ai-status-dot ai-status-${state}`} />;
}

export default StatusDot;
