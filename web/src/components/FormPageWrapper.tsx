import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const FormPageWrapper = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className='flex h-full flex-col overflow-hidden'>
    <Card className='flex w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
      <CardHeader className='border-b border-gray-100 pb-4'>
        <CardTitle className='text-2xl font-semibold tracking-tight text-blue-700'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='flex-1 overflow-y-scroll'>{children}</CardContent>
    </Card>
  </div>
);
