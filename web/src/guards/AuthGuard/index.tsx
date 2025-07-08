'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { signOut, useSession } from 'next-auth/react';

import { PATH } from '@/constants/path.constant';
import type { NextJSChildren } from '@/types';

const AuthGuard: React.FC<NextJSChildren> = ({ children }) => {
  const { status, data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    if (!session || session?.error) {
      void signOut({ redirect: false });
      router.push(PATH.LOGIN);
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <></>;
  }

  if (!session || session?.error) {
    return <></>;
  }

  return <>{children}</>;
};

export default AuthGuard;
