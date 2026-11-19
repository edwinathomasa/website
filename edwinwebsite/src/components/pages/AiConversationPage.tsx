import { memo } from 'react';
import { STRINGS } from '../../constants/strings';
import { useVoiceChat } from '../../hooks/useVoiceChat';
import {
  PortfolioProvider,
  usePortfolioState,
} from '../../state/PortfolioContext';
import ParticlesBackdrop from '../atoms/ParticlesBackdrop';
import StrandsMicTrigger from '../molecules/StrandsMicTrigger';
import AiConversationBox from '../organisms/AiConversationBox';
import TopNavigationBar from '../organisms/TopNavigationBar';
import AiConversationTemplate from '../templates/AiConversationTemplate';

export interface AiConversationPageProps {
  readonly onNavigateBack?: () => void;
}

const AiConversationPageContent = memo(function AiConversationPageContent({
  onNavigateBack,
}: AiConversationPageProps) {
  const profile = usePortfolioState();
  const { session, messages, toggleVoiceAction } = useVoiceChat();

  const { status } = session;

  return (
    <AiConversationTemplate
      backdrop={<ParticlesBackdrop />}
      topbar={
        <TopNavigationBar
          monogram="AI"
          title={`${profile.name} — Voice AI`}
          subtitle={STRINGS.voice.status[status]}
          onNavigateBack={onNavigateBack}
          voiceStatus={status}
        />
      }
      conversationBox={
        <AiConversationBox
          profileName={profile.name}
          session={session}
          messages={messages}
        />
      }
      bottomTrigger={
        <StrandsMicTrigger status={status} onToggleVoice={toggleVoiceAction} />
      }
    />
  );
});

const AiConversationPage = memo(function AiConversationPage({
  onNavigateBack,
}: AiConversationPageProps) {
  return (
    <PortfolioProvider>
      <AiConversationPageContent onNavigateBack={onNavigateBack} />
    </PortfolioProvider>
  );
});

export default AiConversationPage;
