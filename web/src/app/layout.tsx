import { Suspense } from 'react';

import type { Metadata } from 'next';
import { PublicEnvScript } from 'next-runtime-env';

import { ToastProvider } from '@/components/ui/toast';
import { LoadingProvider } from '@/contexts';
import { SessionProvider } from '@/contexts/SessionContext';
import type { NextJSChildren } from '@/types';

import './globals.scss';

export const metadata: Metadata = {
  metadataBase: new URL('https://aircommerce.co.th'),
  title: 'AIRCommerce',
};

const RootLayout = ({ children }: NextJSChildren) => {
  return (
    <html lang='th'>
      <head>
        <PublicEnvScript />

        <link
          as='font'
          crossOrigin='anonymous'
          href='/assets/fonts/noto-sans-thai/NotoSansThai-VariableFont_wdth,wght.ttf'
          rel='preload'
          type='font/ttf'
        />
      </head>

      <body className='bg-surface-primary'>
        <Suspense fallback={<></>}>
          <SessionProvider>
            <ToastProvider>
              <LoadingProvider>{children}</LoadingProvider>
            </ToastProvider>
          </SessionProvider>
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
