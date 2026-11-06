import { useCallback } from 'react';
import AiVoiceWidget from '../components/organisms/AiVoiceWidget';
import { useVoiceChat } from '../hooks/useVoiceChat';

/**
 * Container component that colocates voice session state (`useVoiceChat`)
 * so voice state transitions never trigger re-renders in the static portfolio sections.
 */
function AiVoiceContainer() {
  const {
    isOpen,
    session,
    messages,
    askQuestion,
    toggleVoiceAction,
    closePanel,
  } = useVoiceChat();

  const handleAskQuestion = useCallback(
    (question: string) => {
      void askQuestion(question);
    },
    [askQuestion]
  );

  return (
    <AiVoiceWidget
      isOpen={isOpen}
      session={session}
      messages={messages}
      onAskQuestion={handleAskQuestion}
      onToggleVoice={toggleVoiceAction}
      onClosePanel={closePanel}
    />
  );
}

export default AiVoiceContainer;
