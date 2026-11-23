import { memo, useEffect, useRef } from 'react';
import { STRINGS } from '../../constants/strings';
import type { ChatTurn, VoiceSessionStatus } from '@portfolio/shared';
import GlassSlab from '../atoms/GlassSlab';
import ChatBubbleCard from '../molecules/ChatBubbleCard';

export interface AiConversationBoxProps {
  readonly profileName: string;
  readonly session: VoiceSessionStatus;
  readonly messages: readonly ChatTurn[];
}

const AiConversationBox = memo(function AiConversationBox({
  profileName,
  session,
  messages,
}: AiConversationBoxProps) {
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const { status } = session;
  const isThinking = status === 'thinking';
  const interimText = status === 'listening' ? session.interimTranscript : '';
  const errorText = status === 'idle' ? session.error : null;

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, interimText, isThinking]);

  return (
    <GlassSlab
      as="main"
      layer={1}
      className="glass-panel ai-conversation-panel"
    >
      <div
        ref={chatScrollRef}
        className="ai-conversation-stream depth-recessed glass-scroll"
        aria-label="AI Voice Conversation"
      >
        {messages.map((msg) => (
          <ChatBubbleCard
            key={msg.id}
            role={msg.role}
            senderName={
              msg.role === 'assistant' ? `${profileName} AI` : 'You'
            }
            text={msg.text}
          />
        ))}

        {interimText && (
          <ChatBubbleCard
            role="user"
            senderName="You (Listening...)"
            text={STRINGS.voice.interimTranscript(interimText)}
            isInterim
          />
        )}

        {isThinking && (
          <ChatBubbleCard
            role="assistant"
            senderName={`${profileName} AI`}
            text={STRINGS.voice.status.thinking}
            isInterim
          />
        )}
      </div>

      {errorText && (
        <p className="ai-screen-error depth-layer-2">{errorText}</p>
      )}
    </GlassSlab>
  );
});

export default AiConversationBox;
