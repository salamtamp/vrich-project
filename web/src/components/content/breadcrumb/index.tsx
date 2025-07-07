import React from 'react';

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
};

type BreadcrumbContentProps = {
  items?: BreadcrumbItem[];
  labelClassName?: string;
  className?: string;
};

const BreadcrumbContent: React.FC<BreadcrumbContentProps> = ({ items, labelClassName, className }) => {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items?.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={crypto.randomUUID()}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className={cn(labelClassName, '!font-medium')}>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className={labelClassName}
                    href={item.href ?? undefined}
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
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
