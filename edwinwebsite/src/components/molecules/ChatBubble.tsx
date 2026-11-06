import { memo } from 'react';
import type { ChatTurn } from '../../types/voice';

interface ChatBubbleProps {
  readonly role: ChatTurn['role'];
  readonly text: string;
  readonly isInterim?: boolean;
}

const ChatBubble = memo(function ChatBubble({
  role,
  text,
  isInterim = false,
}: ChatBubbleProps) {
  const roleClass = role === 'user' ? 'ai-bubble-user' : 'ai-bubble-assistant';
  const interimClass = isInterim ? 'ai-bubble-interim' : '';

  return (
    <div className={`ai-voice-bubble ${roleClass} ${interimClass}`.trim()}>
      {text}
    </div>
  );
});

export default ChatBubble;
