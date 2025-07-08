'use client';

import { createContext, useMemo } from 'react';

import { SessionProvider as NextAuthProvider } from 'next-auth/react';

import { publicEnv } from '@/constants/env/public-env';
import type { NextJSChildren } from '@/types';

const SessionContext = createContext({});

export const SessionProvider: React.FC<NextJSChildren> = ({ children }) => {
  const sessionValue = useMemo(() => ({}), []);

  return (
    <SessionContext.Provider value={sessionValue}>
      <NextAuthProvider
        refetchOnWindowFocus
        refetchInterval={publicEnv.refetchInterval ? +publicEnv.refetchInterval : 5 * 60}
      >
        {children}
      </NextAuthProvider>
    </SessionContext.Provider>
  );
};
