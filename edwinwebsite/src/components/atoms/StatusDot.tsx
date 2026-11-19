import { memo } from 'react';
import type { VoiceState } from '../../types/voice';

export interface StatusDotProps {
  readonly status: VoiceState;
}

const StatusDot = memo(function StatusDot({ status }: StatusDotProps) {
  return <span className={`voice-dot voice-dot-${status}`} />;
});

export default StatusDot;
