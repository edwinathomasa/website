import { memo } from 'react';
import { STRINGS } from '../../constants/strings';
import type { VoiceState } from '../../types/voice';
import StrandsOrb from '../atoms/StrandsOrb';

export interface StrandsMicTriggerProps {
  readonly status: VoiceState;
  readonly onToggleVoice: () => void;
}

const StrandsMicTrigger = memo(function StrandsMicTrigger({
  status,
  onToggleVoice,
}: StrandsMicTriggerProps) {
  const isThinking = status === 'thinking';
  const isActiveAudio = status === 'listening' || status === 'speaking';

  return (
    <footer className="ai-strands-footer">
      <button
        type="button"
        className={`strands-orb-button depth-layer-3 strands-orb-${status}`}
        onClick={onToggleVoice}
        aria-label={STRINGS.aria.voiceButton}
        title={STRINGS.voice.button[status]}
      >
        <StrandsOrb
          listening={isActiveAudio}
          energy={isThinking ? 0.95 : 0.65}
          speed={isThinking ? 1.45 : 1}
        />
      </button>
      <span className="strands-caption">
        {status === 'idle'
          ? 'Tap the orb to speak'
          : STRINGS.voice.status[status]}
      </span>
    </footer>
  );
});

export default StrandsMicTrigger;
