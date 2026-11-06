import { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { ICON_SIZES, UI_LABELS } from '../../constants/config';
import type { ChatTurn, VoiceState } from '../../types/voice';
import Chip from '../atoms/Chip';
import IconButton from '../atoms/IconButton';
import StatusDot from '../atoms/StatusDot';
import ChatBubble from '../molecules/ChatBubble';
import VoiceInputForm from '../molecules/VoiceInputForm';

interface AiVoicePanelProps {
  voiceState: VoiceState;
  messages: ChatTurn[];
  interimTranscript: string;
  errorMessage: string | null;
  onAskQuestion: (question: string) => void;
  onClose: () => void;
}

function AiVoicePanel({
  voiceState,
  messages,
  interimTranscript,
  errorMessage,
  onAskQuestion,
  onClose,
}: AiVoicePanelProps) {
  const chatLogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages, interimTranscript]);

  return (
    <div
      className="ai-voice-panel"
      role="dialog"
      aria-label={UI_LABELS.ARIA.VOICE_DIALOG}
    >
      <div className="ai-voice-panel-header">
        <div className="ai-voice-status">
          <StatusDot state={voiceState} />
          <span className="ai-status-label">{UI_LABELS.VOICE.STATUS[voiceState]}</span>
        </div>
        <IconButton
          className="ai-voice-close"
          onClick={onClose}
          ariaLabel={UI_LABELS.ARIA.CLOSE_VOICE}
        >
          <FaTimes size={ICON_SIZES.SM} />
        </IconButton>
      </div>

      <div className="ai-voice-messages" ref={chatLogRef}>
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} role={msg.role} text={msg.text} />
        ))}
        {interimTranscript && (
          <ChatBubble role="user" text={`${interimTranscript}...`} isInterim />
        )}
      </div>

      {errorMessage && <p className="ai-voice-error">{errorMessage}</p>}

      <div className="ai-quick-prompts">
        {UI_LABELS.VOICE.QUICK_PROMPTS.map((prompt) => (
          <Chip
            key={prompt}
            label={prompt}
            variant="prompt"
            disabled={voiceState === 'thinking'}
            onClick={() => onAskQuestion(prompt)}
          />
        ))}
      </div>

      <VoiceInputForm
        disabled={voiceState === 'thinking'}
        onSubmitQuestion={onAskQuestion}
      />
    </div>
  );
}

export default AiVoicePanel;
