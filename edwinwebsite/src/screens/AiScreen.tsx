import { memo, useEffect, useRef } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import Strands from '../components/Strands';
import TiltCard from '../components/TiltCard';
import { STRINGS } from '../constants/strings';
import { useVoiceChat } from '../hooks/useVoiceChat';
import Particles from '../Particles';
import { PortfolioProvider, usePortfolioState } from '../state/PortfolioContext';

const PARTICLE_COLORS = ['#8C6D53', '#6E6A63', '#22211E'] as const;

export interface AiScreenProps {
  readonly onNavigateBack?: () => void;
}

const AiConversationWorkspace = memo(function AiConversationWorkspace({
  onNavigateBack,
}: AiScreenProps) {
  const profile = usePortfolioState();
  const { session, messages, askQuestion, toggleVoiceAction } = useVoiceChat({
    autoPlayWelcome: true,
  });
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const { status } = session;
  const isThinking = status === 'thinking';
  const isActiveAudio = status === 'listening' || status === 'speaking';
  const interimText = status === 'listening' ? session.interimTranscript : '';
  const errorText = status === 'idle' ? session.error : null;

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, interimText, isThinking]);

  return (
    <div className="ai-screen-viewport">
      {/* Top Glossy Glass Header */}
      <header className="glass-panel depth-layer-1 resume-topbar ai-topbar">
        <div className="topbar-identity">
          {onNavigateBack && (
            <button
              type="button"
              className="glass-icon-link depth-layer-3"
              onClick={onNavigateBack}
              aria-label="Back to home screen"
              title="Back"
            >
              <FaArrowLeft size={14} />
            </button>
          )}
          <span className="topbar-monogram depth-layer-3" aria-hidden="true">
            AI
          </span>
          <div>
            <h1 className="topbar-name">{profile.name} — Voice AI</h1>
            <p className="topbar-role">{STRINGS.voice.status[status]}</p>
          </div>
        </div>

        <div className="ai-status-pill depth-layer-3">
          <span className={`voice-dot voice-dot-${status}`} />
          <span>{STRINGS.voice.status[status]}</span>
        </div>
      </header>

      {/* Center Glossy Glassmorphism Conversation Stream */}
      <main className="glass-panel depth-layer-1 ai-conversation-panel">
        <div
          ref={chatScrollRef}
          className="ai-conversation-stream depth-recessed glass-scroll"
          aria-label="AI Voice Conversation"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`ai-chat-row ${
                msg.role === 'assistant' ? 'ai-row-left' : 'ai-row-right'
              }`}
            >
              <TiltCard
                as="article"
                layer={2}
                maxTilt={2.5}
                className={`ai-glossy-bubble ${
                  msg.role === 'assistant'
                    ? 'ai-glossy-bubble-left'
                    : 'ai-glossy-bubble-right'
                }`}
              >
                <span className="ai-bubble-sender">
                  {msg.role === 'assistant' ? `${profile.name} AI` : 'You'}
                </span>
                <p className="ai-bubble-text">{msg.text}</p>
              </TiltCard>
            </div>
          ))}

          {interimText && (
            <div className="ai-chat-row ai-row-right">
              <div className="ai-glossy-bubble depth-layer-2 ai-glossy-bubble-right ai-glossy-bubble-interim">
                <span className="ai-bubble-sender">You (Listening...)</span>
                <p className="ai-bubble-text">
                  {STRINGS.voice.interimTranscript(interimText)}
                </p>
              </div>
            </div>
          )}

          {isThinking && (
            <div className="ai-chat-row ai-row-left">
              <div className="ai-glossy-bubble depth-layer-2 ai-glossy-bubble-left ai-glossy-bubble-interim">
                <span className="ai-bubble-sender">{profile.name} AI</span>
                <p className="ai-bubble-text">{STRINGS.voice.status.thinking}</p>
              </div>
            </div>
          )}
        </div>

        {errorText && <p className="ai-screen-error depth-layer-2">{errorText}</p>}

        <div className="ai-screen-prompts">
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
      </main>

      {/* Bottom Centered React Bits Strands Mic Trigger */}
      <footer className="ai-strands-footer">
        <button
          type="button"
          className={`strands-orb-button depth-layer-3 strands-orb-${status}`}
          onClick={toggleVoiceAction}
          aria-label={STRINGS.aria.voiceButton}
          title={STRINGS.voice.button[status]}
        >
          <Strands
            listening={isActiveAudio}
            energy={isThinking ? 0.95 : 0.65}
            speed={isThinking ? 1.45 : 1}
          />
        </button>
        <span className="strands-caption">
          {status === 'idle'
            ? 'Tap the orb to speak'
            : STRINGS.voice.status[status]}
        </span>
      </footer>
    </div>
  );
});

const AiScreen = memo(function AiScreen({ onNavigateBack }: AiScreenProps) {
  return (
    <PortfolioProvider>
      <div className="screen-container">
        <div className="particles-backdrop depth-bg" aria-hidden="true">
          <Particles
            particleColors={PARTICLE_COLORS}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            glow={0.5}
            twinkle={0.3}
            moveParticlesOnHover={false}
            hoverEffect="parallax"
            sizeRandomness={1}
            shape="circle"
            depthOfField={0}
            connections={false}
            connectionDistance={110}
            particleHoverFactor={1}
            hoverRadius={140}
            drift="none"
            driftSpeed={1}
            alphaParticles={false}
            disableRotation={false}
            cameraDistance={20}
            variation={0}
            opacity={1}
            clickBurst={false}
            intro
            lightMode={false}
          />
        </div>

        <AiConversationWorkspace onNavigateBack={onNavigateBack} />
      </div>
    </PortfolioProvider>
  );
});

export default AiScreen;
