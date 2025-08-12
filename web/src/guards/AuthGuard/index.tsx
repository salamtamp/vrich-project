'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { signOut, useSession } from 'next-auth/react';

import { PATH } from '@/constants/path.constant';
import dayjs from '@/lib/dayjs';
import type { NextJSChildren } from '@/types';

const AuthGuard: React.FC<NextJSChildren> = ({ children }) => {
  const { status, data: session } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    const isTokenExpired = session?.expires && dayjs().isAfter(dayjs.unix(session.expires));

    if (isTokenExpired) {
      void signOut({ redirect: false });
      router.push(PATH.LOGIN);
    }
  }, [session, status, router]);

  if (isLoading || !session || session?.error) {
    return <></>;
  }

  return <>{children}</>;
};

export default AuthGuard;
