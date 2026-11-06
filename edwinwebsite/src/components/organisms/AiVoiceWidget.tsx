import { FaMicrophone, FaStop, FaVolumeUp } from 'react-icons/fa';
import { ICON_SIZES, UI_LABELS } from '../../constants/config';
import { useVoiceChat } from '../../hooks/useVoiceChat';
import AiVoicePanel from './AiVoicePanel';

function AiVoiceWidget() {
  const {
    isOpen,
    voiceState,
    messages,
    interimTranscript,
    errorMessage,
    askQuestion,
    toggleVoiceAction,
    closePanel,
  } = useVoiceChat();

  return (
    <>
      {isOpen && (
        <AiVoicePanel
          voiceState={voiceState}
          messages={messages}
          interimTranscript={interimTranscript}
          errorMessage={errorMessage}
          onAskQuestion={(q) => void askQuestion(q)}
          onClose={closePanel}
        />
      )}

      <button
        type="button"
        className={`ai-voice-button ${
          voiceState !== 'idle' ? `ai-voice-button-${voiceState}` : ''
        }`}
        onClick={toggleVoiceAction}
        aria-label={UI_LABELS.ARIA.VOICE_BUTTON}
      >
        {voiceState === 'listening' ? (
          <FaStop className="ai-voice-icon" size={ICON_SIZES.SM} />
        ) : voiceState === 'speaking' ? (
          <FaVolumeUp className="ai-voice-icon" size={ICON_SIZES.MD} />
        ) : (
          <FaMicrophone className="ai-voice-icon" size={ICON_SIZES.MD} />
        )}
        <span className="ai-voice-text">{UI_LABELS.VOICE.BUTTON[voiceState]}</span>
      </button>
    </>
  );
}

export default AiVoiceWidget;
