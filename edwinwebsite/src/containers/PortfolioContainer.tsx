import HomePage from '../components/pages/HomePage';
import { usePortfolioState } from '../state/PortfolioContext';
import AiVoiceContainer from './AiVoiceContainer';

/**
 * Top-level container connecting Global Client State (`usePortfolioState`)
 * to the pure presentational `HomePage` and colocated `AiVoiceContainer`.
 */
function PortfolioContainer() {
  const profile = usePortfolioState();

  return (
    <HomePage
      profile={profile}
      floatingAction={<AiVoiceContainer />}
    />
  );
}

export default PortfolioContainer;
