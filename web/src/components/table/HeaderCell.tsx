import React from 'react';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { TableHead } from '@/components/ui/table';

import type { TableColumn } from './types';

type HeaderCellProps<T extends Record<string, unknown>> = {
  index: number;
  lastIndex: number;
  column: TableColumn<T>;
  isSorted?: boolean;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
};

const HeaderCell = <T extends Record<string, unknown>>({
  index,
  lastIndex,
  column,
  isSorted,
  sortOrder,
  onSort,
}: HeaderCellProps<T>) => {
  const { key, label, sortable, className, width, align, headerAlign } = column;
  let sortIcon: React.ReactNode = null;
  if (sortable) {
    if (isSorted) {
      sortIcon = sortOrder === 'asc' ? <ArrowUp className='size-4' /> : <ArrowDown className='size-4' />;
    } else {
      sortIcon = <ArrowUp className='size-4 opacity-20' />;
    }
  }
  let ariaSort: 'ascending' | 'descending' | 'none' = 'none';
  if (isSorted) {
    ariaSort = sortOrder === 'asc' ? 'ascending' : 'descending';
  }
  let roundedClass = '';
  if (index === 0) {
    roundedClass = 'rounded-tl-lg';
  } else if (index === lastIndex) {
    roundedClass = 'rounded-tr-lg';
  }
  return (
    <TableHead
      aria-sort={ariaSort}
      role={sortable ? 'button' : undefined}
      className={twMerge(
        className,
        sortable && 'cursor-pointer select-none',
        roundedClass,
        'bg-gray-200 hover:bg-gray-200'
      )}
      style={
        width
          ? { maxWidth: width, minWidth: width, textAlign: headerAlign ?? align ?? 'left' }
          : { textAlign: headerAlign ?? align ?? 'left' }
      }
      onClick={
        sortable && onSort
          ? () => {
              onSort(key);
            }
          : undefined
      }
    >
      <span className='flex items-center gap-1'>
        {label}
        {sortIcon}
      </span>
    </TableHead>
  );
};

export default HeaderCell;
