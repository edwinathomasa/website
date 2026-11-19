import { useCallback, useEffect, useState } from 'react';
import AiConversationPage from './components/pages/AiConversationPage';
import LandingPage from './components/pages/LandingPage';
import PortfolioPage from './components/pages/PortfolioPage';
import { unlockAudioPlayback } from './services/audio/elevenLabsTts';

type ScreenName = 'landing' | 'portfolio' | 'ai';

function getScreenFromLocation(): ScreenName {
  if (typeof window === 'undefined') return 'landing';
  const hash = window.location.hash;
  const path = window.location.pathname;
  if (hash === '#/portfolio' || path === '/portfolio') {
    return 'portfolio';
  }
  if (hash === '#/ai' || path === '/ai') {
    return 'ai';
  }
  return 'landing';
}

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenName>(
    getScreenFromLocation
  );

  useEffect(() => {
    const handlePopState = () => {
      setActiveScreen(getScreenFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateToPortfolio = useCallback(() => {
    window.history.pushState({ screen: 'portfolio' }, '', '#/portfolio');
    setActiveScreen('portfolio');
  }, []);

  const navigateToAi = useCallback(() => {
    unlockAudioPlayback();
    window.history.pushState({ screen: 'ai' }, '', '#/ai');
    setActiveScreen('ai');
  }, []);

  const navigateToLanding = useCallback(() => {
    window.history.pushState({ screen: 'landing' }, '', '#/');
    setActiveScreen('landing');
  }, []);

  if (activeScreen === 'portfolio') {
    return <PortfolioPage onNavigateBack={navigateToLanding} />;
  }

  if (activeScreen === 'ai') {
    return <AiConversationPage onNavigateBack={navigateToLanding} />;
  }

  return (
    <LandingPage
      onNavigatePortfolio={navigateToPortfolio}
      onNavigateAi={navigateToAi}
    />
  );
}

export default App;
