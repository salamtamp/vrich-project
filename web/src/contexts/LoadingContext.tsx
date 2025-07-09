'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import Spinner from '@/components/ui/spinner';

type LoadingContextType = {
  openLoading: () => void;
  closeLoading: () => void;
  isLoading: boolean;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const openLoading = useCallback(() => {
    setIsLoading(true);
  }, []);
  const closeLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const value = useMemo(
    () => ({ openLoading, closeLoading, isLoading }),
    [openLoading, closeLoading, isLoading]
  );

  return (
    <LoadingContext.Provider value={value}>
      {isLoading ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spinner />
        </div>
      ) : null}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
