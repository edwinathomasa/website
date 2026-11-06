import './App.css';
import PortfolioContainer from './containers/PortfolioContainer';
import { PortfolioProvider } from './state/PortfolioContext';

function App() {
  return (
    <PortfolioProvider>
      <PortfolioContainer />
    </PortfolioProvider>
  );
}

export default App;
