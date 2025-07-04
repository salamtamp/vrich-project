import { Suspense } from 'react';

import type { Metadata } from 'next';
import { PublicEnvScript } from 'next-runtime-env';

import type { NextJSChildren } from '@/types';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://vrich.cariva.co.th'),
  title: 'Vrich',
};

const RootLayout = ({ children }: NextJSChildren) => {
  return (
    <html lang='th'>
      <head>
        <PublicEnvScript />
      </head>

      <body>
        <Suspense fallback={<></>}>{children}</Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
