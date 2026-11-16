import { useCallback, useEffect, useState } from 'react';
import AiScreen from './screens/AiScreen';
import LandingScreen from './screens/LandingScreen';
import PortfolioScreen from './screens/PortfolioScreen';

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
    window.history.pushState({ screen: 'ai' }, '', '#/ai');
    setActiveScreen('ai');
  }, []);

  const navigateToLanding = useCallback(() => {
    window.history.pushState({ screen: 'landing' }, '', '#/');
    setActiveScreen('landing');
  }, []);

  if (activeScreen === 'portfolio') {
    return <PortfolioScreen onNavigateBack={navigateToLanding} />;
  }

  if (activeScreen === 'ai') {
    return <AiScreen onNavigateBack={navigateToLanding} />;
  }

  return (
    <LandingScreen
      onNavigatePortfolio={navigateToPortfolio}
      onNavigateAi={navigateToAi}
    />
  );
}

export default App;
