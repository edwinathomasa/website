import { createContext, useContext, type ReactNode } from 'react';
import profileData from '../data/profile';
import type { Profile } from '../types/profile';

const PortfolioStateContext = createContext<Profile>(profileData);

interface PortfolioProviderProps {
  readonly children: ReactNode;
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  return (
    <PortfolioStateContext.Provider value={profileData}>
      {children}
    </PortfolioStateContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePortfolioState(): Profile {
  return useContext(PortfolioStateContext);
}
