import type { ChatTurn } from '../../types/voice';

interface ChatBubbleProps {
  role: ChatTurn['role'];
  text: string;
  isInterim?: boolean;
}

function ChatBubble({ role, text, isInterim = false }: ChatBubbleProps) {
  const roleClass = role === 'user' ? 'ai-bubble-user' : 'ai-bubble-assistant';
  const interimClass = isInterim ? 'ai-bubble-interim' : '';

  return (
    <div className={`ai-voice-bubble ${roleClass} ${interimClass}`.trim()}>
      {text}
    </div>
  );
}

export default ChatBubble;
