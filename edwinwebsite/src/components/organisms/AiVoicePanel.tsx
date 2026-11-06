import { memo, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { ICON_SIZES } from '../../constants/config';
import { STRINGS } from '../../constants/strings';
import type { ChatTurn, VoiceSessionStatus } from '../../types/voice';
import Chip from '../atoms/Chip';
import IconButton from '../atoms/IconButton';
import StatusDot from '../atoms/StatusDot';
import ChatBubble from '../molecules/ChatBubble';
import VoiceInputForm from '../molecules/VoiceInputForm';

interface AiVoicePanelProps {
  readonly session: VoiceSessionStatus;
  readonly messages: readonly ChatTurn[];
  readonly onAskQuestion: (question: string) => void;
  readonly onClose: () => void;
}

const AiVoicePanel = memo(function AiVoicePanel({
  session,
  messages,
  onAskQuestion,
  onClose,
}: AiVoicePanelProps) {
  const chatLogRef = useRef<HTMLDivElement | null>(null);
  const isThinking = session.status === 'thinking';
  const interimText =
    session.status === 'listening' ? session.interimTranscript : '';
  const errorText = session.status === 'idle' ? session.error : null;

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages, interimText]);

  return (
    <div
      className="ai-voice-panel"
      role="dialog"
      aria-label={STRINGS.aria.voiceDialog}
    >
      <div className="ai-voice-panel-header">
        <div className="ai-voice-status">
          <StatusDot state={session.status} />
          <span className="ai-status-label">
            {STRINGS.voice.status[session.status]}
          </span>
        </div>
        <IconButton
          className="ai-voice-close"
          onClick={onClose}
          ariaLabel={STRINGS.aria.closeVoice}
        >
          <FaTimes size={ICON_SIZES.SM} />
        </IconButton>
      </div>

      <div className="ai-voice-messages" ref={chatLogRef}>
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} text={msg.text} />
        ))}
        {interimText && (
          <ChatBubble
            role="user"
            text={STRINGS.voice.interimTranscript(interimText)}
            isInterim
          />
        )}
      </div>

      {errorText && <p className="ai-voice-error">{errorText}</p>}

      <div className="ai-quick-prompts">
        {STRINGS.voice.quickPrompts.map((prompt) => (
          <Chip
            key={prompt}
            label={prompt}
            variant="prompt"
            disabled={isThinking}
            onClick={() => onAskQuestion(prompt)}
          />
        ))}
      </div>

      <VoiceInputForm
        disabled={isThinking}
        onSubmitQuestion={onAskQuestion}
      />
    </div>
  );
});

export default AiVoicePanel;
