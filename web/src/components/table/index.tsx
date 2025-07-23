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
  const headerRef = useRef<HTMLTableElement | null>(null);
  const bodyRef = useRef<HTMLTableElement | null>(null);

  // Calculate column widths
  const columnWidths = useMemo(() => {
    const totalColumns = columns.length;
    return columns.map((column) => {
      if (typeof column.width === 'number') {
        return `${column.width * 0.8}px`;
      }
      // If no width specified, distribute equally
      return `${100 / totalColumns}%`;
    });
  }, [columns]);

  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
      tableContainerRef.current.scrollLeft = 0;
    }
  }, [isLoading]);

  // Sync scroll between header and body
  useEffect(() => {
    const syncWidths = () => {
      if (headerRef.current && bodyRef.current) {
        const headerCells = headerRef.current.querySelectorAll('th');
        const bodyFirstRow = bodyRef.current.querySelector('tr');
        const bodyCells = bodyFirstRow?.querySelectorAll('td');

        if (headerCells.length && bodyCells?.length) {
          headerCells.forEach((headerCell, index) => {
            const bodyCell = bodyCells[index];
            if (bodyCell) {
              const width = columnWidths[index];
              headerCell.style.width = width;
              headerCell.style.minWidth = width;
              headerCell.style.maxWidth = width;
              bodyCell.style.width = width;
              bodyCell.style.minWidth = width;
              bodyCell.style.maxWidth = width;
            }
          });
        }
      }
    };

    // Sync widths after render
    const timer = setTimeout(syncWidths, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [data, isLoading, columnWidths]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerRef.current) {
      headerRef.current.style.transform = `translateX(-${e.currentTarget.scrollLeft}px)`;
    }
  };

  const tableHeader = useMemo(
    () => (
      <TableHeader>
        <TableRow>
          {columns.map((column, cIndex) => (
            <HeaderCell<T>
              key={column.key}
              column={column}
              index={cIndex}
              isSorted={sortBy === column.key}
              lastIndex={columns.length - 1}
              sortOrder={sortOrder}
              width={columnWidths[cIndex]}
              onSort={column.sortable ? onSort : undefined}
            />
          ))}
        </TableRow>
      </TableHeader>
    ),
    [columns, sortBy, sortOrder, onSort, columnWidths]
  );

  if (isLoading) {
    return (
      <div className='flex w-full flex-col overflow-hidden rounded-md'>
        {/* Fixed Header */}
        <div className='border-b bg-white'>
          <ShadcnTable
            ref={headerRef}
            className='w-full table-fixed'
            style={{ width: '100%' }}
          >
            {tableHeader}
          </ShadcnTable>
        </div>

        {/* Scrollable Body */}
        <div
          className='flex-1 overflow-auto'
          onScroll={handleScroll}
        >
          <ShadcnTable
            ref={bodyRef}
            className='w-full table-fixed'
            style={{ width: '100%' }}
          >
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
                        width={columnWidths[cIndex]}
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
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className='flex w-full justify-center py-8'>{emptyStateComponent ?? <span>No data</span>}</div>
    );
  }

  return (
    <div className='flex w-full flex-1 flex-col overflow-hidden rounded-md'>
      {/* Fixed Header */}
      <div className='border-b bg-white shadow-sm'>
        <ShadcnTable
          ref={headerRef}
          className='w-full table-fixed'
          style={{ width: '100%' }}
        >
          {tableHeader}
        </ShadcnTable>
      </div>

      {/* Scrollable Body */}
      <div
        ref={tableContainerRef}
        className='flex-1 overflow-auto'
        onScroll={handleScroll}
      >
        <ShadcnTable
          ref={bodyRef}
          className='w-full table-fixed'
          style={{ width: '100%' }}
        >
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
                {columns.map((column, cIndex) => (
                  <BodyCell
                    key={crypto.randomUUID()}
                    column={column}
                    lastItem={rowIdx === data.length - 1}
                    row={row}
                    width={columnWidths[cIndex]}
                  />
                ))}
              </TableRow>
            ))}
          </TableBody>
        </ShadcnTable>
      </div>
    </div>
  );
};

export default Table;
