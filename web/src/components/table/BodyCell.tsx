import React from 'react';

import { twMerge } from 'tailwind-merge';

import { TableCell } from '@/components/ui/table';

import type { TableColumn } from './types';

type BodyCellProps<T extends Record<string, unknown>> = {
  column: TableColumn<T>;
  row: T;
  isLoading?: boolean;
  lastItem?: boolean;
  skeletonWidthPercent?: string;
  width?: string; // Add width prop
};

function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      // @ts-expect-error: dynamic access
      return acc[part];
    }
    return undefined;
  }, obj);
}

const BodyCell = <T extends Record<string, unknown>>({
  column,
  row,
  isLoading,
  lastItem,
  skeletonWidthPercent,
  width, // Accept width prop
}: BodyCellProps<T>) => {
  const { render, key, className, bodyAlign, align, bold } = column;

  let content: React.ReactNode;
  if (render) {
    content = render(row);
  } else {
    const value = getNestedValue(row, key);
    if (typeof value === 'undefined' || value === null) {
      content = '-';
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      content = String(value);
    } else {
      content = '[object]';
    }
  }

  return (
    <TableCell
      className={twMerge(
        'overflow-hidden border-b border-gray-300',
        className,
        bold && 'font-bold',
        lastItem && 'border-none'
      )}
      style={{
        width: width ?? column.width,
        minWidth: width ?? column.width,
        maxWidth: width ?? column.width,
        textAlign: bodyAlign ?? align ?? 'left',
      }}
    >
      {isLoading ? (
        <div className='flex'>
          <div
            className='inline-block h-4 animate-pulse rounded-lg bg-muted'
            style={{ width: skeletonWidthPercent ?? '80%' }}
          />
        </div>
      ) : (
        content
      )}
    </TableCell>
  );
};

export default BodyCell;
