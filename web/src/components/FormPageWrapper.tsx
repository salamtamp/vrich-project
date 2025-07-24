import React from 'react';

import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const FormPageWrapper = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className='flex h-full min-h-full flex-col overflow-hidden'>
    <Card className='flex min-h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
      <CardHeader className='border-b border-gray-100 pb-4'>
        <CardTitle className='text-2xl font-semibold tracking-tight text-blue-700'>{title}</CardTitle>
      </CardHeader>
      <CardContent className={cn('mt-1 flex-1 overflow-y-scroll', className)}>{children}</CardContent>
    </Card>
  </div>
);
