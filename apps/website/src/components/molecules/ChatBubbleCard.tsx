import { memo } from 'react';
import type { ChatTurn } from '@portfolio/shared';
import GlassSlab from '../atoms/GlassSlab';

export interface ChatBubbleCardProps {
  readonly role: ChatTurn['role'];
  readonly text: string;
  readonly senderName?: string;
  readonly isInterim?: boolean;
}

const ChatBubbleCard = memo(function ChatBubbleCard({
  role,
  text,
  senderName,
  isInterim = false,
}: ChatBubbleCardProps) {
  return (
    <div
      className={`ai-chat-row ${
        role === 'assistant' ? 'ai-row-left' : 'ai-row-right'
      }`}
    >
      <GlassSlab
        as="article"
        layer={2}
        className={`ai-glossy-bubble ${
          role === 'assistant'
            ? 'ai-glossy-bubble-left'
            : 'ai-glossy-bubble-right'
        } ${isInterim ? 'ai-glossy-bubble-interim' : ''}`.trim()}
      >
        {senderName && <span className="ai-bubble-sender">{senderName}</span>}
        <p className="ai-bubble-text">{text}</p>
      </GlassSlab>
    </div>
  );
});

export default ChatBubbleCard;
