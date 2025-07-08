'use client';
import React from 'react';

import { useRouter } from 'next/navigation';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

export type BreadcrumbItem = {
  label: string;
  href?: string | null;
  push?: string | null;
};

type BreadcrumbContentProps = {
  items?: BreadcrumbItem[];
  labelClassName?: string;
  className?: string;
};

const BreadcrumbContent: React.FC<BreadcrumbContentProps> = ({ items, labelClassName, className }) => {
  const router = useRouter();

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items?.map((item, index) => {
          const isLast = index === items.length - 1;

          let content: React.ReactNode;
          if (isLast) {
            content = (
              <BreadcrumbPage className={cn(labelClassName, '!font-medium')}>{item.label}</BreadcrumbPage>
            );
          } else if (item.label) {
            content = (
              <BreadcrumbLink
                className={cn(labelClassName, item.push && 'cursor-pointer')}
                href={item.href ?? undefined}
                onClick={() => {
                  if (item.push) {
                    router.push(item.push);
                  }
                }}
              >
                {item.label}
              </BreadcrumbLink>
            );
          }

          if (!item.label) {
            content = <p className='bg-loading-container h-6 w-14' />;
          }

          return (
            <React.Fragment key={crypto.randomUUID()}>
              <BreadcrumbItem className='max-w-[100px]'>
                <div className='truncate'>{content}</div>
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbContent;
