'use client';

import React, { useEffect, useMemo, useRef } from 'react';

import { twMerge } from 'tailwind-merge';

import { Table as ShadcnTable, TableBody, TableHeader, TableRow } from '@/components/ui/table';

import BodyCell from './BodyCell';
import HeaderCell from './HeaderCell';
import type { TableColumn, TableProps } from './types';

export type { TableColumn, TableProps };

const LOADING_ROWS_COUNT = 5;
const SKELETON_WIDTH_PATTERNS = [
  ['80%', '60%', '90%', '70%', '50%'],
  ['60%', '80%', '70%', '90%', '60%'],
  ['90%', '70%', '80%', '60%', '80%'],
  ['70%', '90%', '60%', '80%', '90%'],
  ['50%', '80%', '60%', '90%', '70%'],
];

const Table = <T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  emptyStateComponent,
  onClickRow,
  bodyRowProps,
  sortBy,
  sortOrder,
  onSort,
}: TableProps<T> & {
  onClickRow?: (e: React.MouseEvent<HTMLTableRowElement>, row: T) => void;
  bodyRowProps?: React.HTMLAttributes<HTMLTableRowElement>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
}) => {
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
      tableContainerRef.current.scrollLeft = 0;
    }
  }, [isLoading]);

  const tableHeader = useMemo(
    () => (
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <HeaderCell
              key={column.key}
              column={column}
              isSorted={sortBy === column.key}
              sortOrder={sortOrder}
              onSort={column.sortable ? onSort : undefined}
            />
          ))}
        </TableRow>
      </TableHeader>
    ),
    [columns, sortBy, sortOrder, onSort]
  );

  if (isLoading) {
    return (
      <div
        ref={tableContainerRef}
        className={twMerge('w-full overflow-x-auto')}
      >
        <ShadcnTable>
          {tableHeader}
          <TableBody>
            {Array(LOADING_ROWS_COUNT)
              .fill(null)
              .map((_, rIndex) => (
                <TableRow key={crypto.randomUUID()}>
                  {columns.map((column, cIndex) => (
                    <BodyCell
                      key={crypto.randomUUID()}
                      isLoading
                      column={column}
                      lastItem={rIndex === LOADING_ROWS_COUNT - 1}
                      row={{} as T}
                      skeletonWidthPercent={
                        SKELETON_WIDTH_PATTERNS[rIndex % SKELETON_WIDTH_PATTERNS.length][
                          cIndex % SKELETON_WIDTH_PATTERNS[0].length
                        ] ?? '80%'
                      }
                    />
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </ShadcnTable>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className='flex w-full justify-center py-8'>{emptyStateComponent ?? <span>No data</span>}</div>
    );
  }

  return (
    <div
      ref={tableContainerRef}
      className={twMerge('w-full overflow-x-auto')}
    >
      <ShadcnTable>
        {tableHeader}
        <TableBody>
          {data.map((row, rowIdx) => (
            <TableRow
              key={crypto.randomUUID()}
              {...bodyRowProps}
              className={twMerge(bodyRowProps?.className, onClickRow && 'cursor-pointer')}
              onClick={
                onClickRow
                  ? (e) => {
                      onClickRow(e, row);
                    }
                  : undefined
              }
            >
              {columns.map((column) => (
                <BodyCell
                  key={crypto.randomUUID()}
                  column={column}
                  lastItem={rowIdx === data.length - 1}
                  row={row}
                />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </ShadcnTable>
    </div>
  );
};

export default Table;
