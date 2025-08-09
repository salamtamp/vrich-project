'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { signOut, useSession } from 'next-auth/react';
import type { FC } from 'react';

import { PATH } from '@/constants/path.constant';
import type { NextJSChildren } from '@/types';

const PublicGuard: FC<NextJSChildren> = ({ children }) => {
  const { status, data: session } = useSession();
  const router = useRouter();

  const isLoadingSession = status === 'loading';
  const isUnauthenticated = status === 'unauthenticated';

  useEffect(() => {
    if (!session) {
      return;
    }

    if (session?.error) {
      void signOut({ callbackUrl: PATH.LOGIN });
      return;
    }

    router.replace(PATH.HOME);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (isLoadingSession || !isUnauthenticated) {
    return <></>;
  }

  return <>{children}</>;
};

export default PublicGuard;
