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
};

const BodyCell = <T extends Record<string, unknown>>({
  column,
  row,
  isLoading,
  lastItem,
  skeletonWidthPercent,
}: BodyCellProps<T>) => {
  const { render, key, className, width, align, bodyAlign, bold } = column;
  let content: React.ReactNode;
  if (render) {
    content = render(row);
  } else if (typeof row[key] === 'undefined' || row[key] === null) {
    content = '-';
  } else if (typeof row[key] === 'string' || typeof row[key] === 'number' || typeof row[key] === 'boolean') {
    content = String(row[key]);
  } else {
    content = '[object]';
  }
  return (
    <TableCell
      className={twMerge(className, bold && 'font-bold', lastItem && 'border-none')}
      style={
        width
          ? { maxWidth: width, minWidth: width, textAlign: bodyAlign ?? align ?? 'left' }
          : { textAlign: bodyAlign ?? align ?? 'left' }
      }
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
