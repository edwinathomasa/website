import { memo, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  FaMicrophone,
  FaPaperPlane,
  FaStop,
  FaTimes,
  FaVolumeUp,
} from 'react-icons/fa';
import { STRINGS } from '../constants/strings';
import { useVoiceChat } from '../hooks/useVoiceChat';

const GlassVoiceAssistant = memo(function GlassVoiceAssistant() {
  const {
    isOpen,
    session,
    messages,
    askQuestion,
    toggleVoiceAction,
    closePanel,
  } = useVoiceChat();

  const [draft, setDraft] = useState('');
  const logRef = useRef<HTMLDivElement | null>(null);
  const { status } = session;
  const isThinking = status === 'thinking';
  const interimText = status === 'listening' ? session.interimTranscript : '';
  const errorText = status === 'idle' ? session.error : null;

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, interimText]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isThinking) return;
    setDraft('');
    void askQuestion(trimmed);
  };

  return (
    <div className="voice-dock">
      {isOpen && (
        <aside
          className="glass-panel depth-layer-1 voice-glass-panel"
          role="dialog"
          aria-label={STRINGS.aria.voiceDialog}
        >
          <header className="voice-panel-header">
            <div className="voice-status-row">
              <span className={`voice-dot voice-dot-${status}`} />
              <span className="voice-status-text">
                {STRINGS.voice.status[status]}
              </span>
            </div>
            <button
              type="button"
              className="glass-icon-btn depth-layer-3"
              onClick={closePanel}
              aria-label={STRINGS.aria.closeVoice}
            >
              <FaTimes size={13} />
            </button>
          </header>

          <div
            className="voice-messages depth-recessed glass-scroll"
            ref={logRef}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`voice-bubble depth-layer-2 voice-bubble-${msg.role}`}
              >
                {msg.text}
              </div>
            ))}
            {interimText && (
              <div className="voice-bubble depth-layer-2 voice-bubble-user voice-bubble-interim">
                {STRINGS.voice.interimTranscript(interimText)}
              </div>
            )}
          </div>

          {errorText && <p className="voice-error-banner">{errorText}</p>}

          <div className="voice-prompts">
            {STRINGS.voice.quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="glass-tag glass-tag-interactive depth-layer-3"
                disabled={isThinking}
                onClick={() => void askQuestion(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form className="voice-input-bar" onSubmit={handleSubmit}>
            <input
              type="text"
              className="glass-input depth-recessed"
              value={draft}
              disabled={isThinking}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={STRINGS.voice.inputPlaceholder}
            />
            <button
              type="submit"
              className="glass-send-btn depth-layer-3"
              disabled={isThinking || !draft.trim()}
              aria-label={STRINGS.aria.sendQuestion}
            >
              <FaPaperPlane size={12} />
            </button>
          </form>
        </aside>
      )}

      <button
        type="button"
        className={`glass-pill-btn depth-layer-3 voice-trigger-btn voice-trigger-${status}`}
        onClick={toggleVoiceAction}
        aria-label={STRINGS.aria.voiceButton}
      >
        {status === 'listening' ? (
          <FaStop size={13} />
        ) : status === 'speaking' ? (
          <FaVolumeUp size={14} />
        ) : (
          <FaMicrophone size={14} />
        )}
        <span>{STRINGS.voice.button[status]}</span>
      </button>
    </div>
  );
});

export default GlassVoiceAssistant;
