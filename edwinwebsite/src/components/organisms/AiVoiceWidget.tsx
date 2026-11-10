import { memo } from 'react';
import { FaMicrophone, FaStop, FaVolumeUp } from 'react-icons/fa';
import { ICON_SIZES } from '../../constants/config';
import { STRINGS } from '../../constants/strings';
import type { ChatTurn, VoiceSessionStatus } from '../../types/voice';
import AiVoicePanel from './AiVoicePanel';

interface AiVoiceWidgetProps {
  readonly isOpen: boolean;
  readonly session: VoiceSessionStatus;
  readonly messages: readonly ChatTurn[];
  readonly onAskQuestion: (question: string) => void;
  readonly onToggleVoice: () => void;
  readonly onClosePanel: () => void;
}

const AiVoiceWidget = memo(function AiVoiceWidget({
  isOpen,
  session,
  messages,
  onAskQuestion,
  onToggleVoice,
  onClosePanel,
}: AiVoiceWidgetProps) {
  const { status } = session;

  return (
    <>
      {isOpen && (
        <AiVoicePanel
          session={session}
          messages={messages}
          onAskQuestion={onAskQuestion}
          onClose={onClosePanel}
        />
      )}

      <button
        type="button"
        className={`ai-voice-button ${
          status !== 'idle' ? `ai-voice-button-${status}` : ''
        }`}
        onClick={onToggleVoice}
        aria-label={STRINGS.aria.voiceButton}
      >
        {status === 'listening' ? (
          <FaStop className="ai-voice-icon" size={ICON_SIZES.SM} />
        ) : status === 'speaking' ? (
          <FaVolumeUp className="ai-voice-icon" size={ICON_SIZES.MD} />
        ) : (
          <FaMicrophone className="ai-voice-icon" size={ICON_SIZES.MD} />
        )}
        <span className="ai-voice-text">{STRINGS.voice.button[status]}</span>
      </button>
    </>
  );
});

export default AiVoiceWidget;
