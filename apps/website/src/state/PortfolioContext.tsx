import type { Profile } from '@portfolio/shared';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { fetchProfile } from '../services/profile/profileService';

const PortfolioStateContext = createContext<Profile | null>(null);

interface PortfolioProviderProps {
  readonly children: ReactNode;
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProfile();
      setProfile(data.profile);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load portfolio data.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--text-primary, #f5f7fb)',
          fontFamily: 'inherit',
        }}
      >
        <p style={{ opacity: 0.75, letterSpacing: '0.04em' }}>
          Loading portfolio...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
          color: 'var(--text-primary, #f5f7fb)',
          textAlign: 'center',
        }}
      >
        <div>
          <p style={{ marginBottom: '1rem', opacity: 0.85 }}>
            {error ?? 'Portfolio profile is unavailable.'}
          </p>
          <button
            type="button"
            className="glass-nav-btn depth-layer-3"
            onClick={() => void loadProfile()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <PortfolioStateContext.Provider value={profile}>
      {children}
    </PortfolioStateContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePortfolioState(): Profile {
  const profile = useContext(PortfolioStateContext);
  if (!profile) {
    throw new Error('usePortfolioState must be used within a PortfolioProvider');
  }
  return profile;
}
