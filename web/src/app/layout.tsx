import { Suspense } from 'react';

import type { Metadata } from 'next';
import { PublicEnvScript } from 'next-runtime-env';

import type { NextJSChildren } from '@/types';

import './globals.scss';

export const metadata: Metadata = {
  metadataBase: new URL('https://vrich.cariva.co.th'),
  title: 'Vrich',
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
        <Suspense fallback={<></>}>{children}</Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
