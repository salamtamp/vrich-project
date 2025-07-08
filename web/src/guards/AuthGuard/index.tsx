'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { signOut, useSession } from 'next-auth/react';

import { PATH } from '@/constants/path.constant';
import type { NextJSChildren } from '@/types';

const AuthGuard: React.FC<NextJSChildren> = ({ children }) => {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      const timeout = setTimeout(() => {
        setTimedOut(true);
      }, 5000);
      return () => {
        clearTimeout(timeout);
      };
    }
    setTimedOut(false);
  }, [status]);

  useEffect(() => {
    if (status === 'loading' && !timedOut) {
      return;
    }
    if (!session || session?.error || timedOut) {
      void signOut({ redirect: false });
      router.push(PATH.LOGIN);
    }
  }, [session, status, router, timedOut]);

  if (status === 'loading' && !timedOut) {
    return <></>;
  }

  if (!session || session?.error || timedOut) {
    return <></>;
  }

  return <>{children}</>;
};

export default AuthGuard;
