import { memo, type ReactNode } from 'react';

export interface AiConversationTemplateProps {
  readonly backdrop?: ReactNode;
  readonly topbar: ReactNode;
  readonly conversationBox: ReactNode;
  readonly bottomTrigger: ReactNode;
}

const AiConversationTemplate = memo(function AiConversationTemplate({
  backdrop,
  topbar,
  conversationBox,
  bottomTrigger,
}: AiConversationTemplateProps) {
  return (
    <div className="screen-container">
      {backdrop}
      <div className="ai-screen-viewport">
        {topbar}
        {conversationBox}
        {bottomTrigger}
      </div>
    </div>
  );
});

export default AiConversationTemplate;
