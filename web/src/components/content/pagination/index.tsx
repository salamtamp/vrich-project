'use client';

import React, { useEffect } from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import usePaginationContext from '@/hooks/useContext/usePaginationContext';
import { cn } from '@/lib/utils';

type ContentPaginationProps = {
  className?: string;
  total?: number;
  limitOptions?: number[];
  shotMode?: boolean;
};
const defaultLimitOption = [15, 30, 50, 100, 200];

const ContentPagination: React.FC<ContentPaginationProps> = ({
  className,
  total = 0,
  limitOptions = defaultLimitOption,
  shotMode = false,
}) => {
  const { update, pagination, reset } = usePaginationContext();
  const { limit, page } = pagination;

  const totalPages = Math.ceil(total / limit);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (page <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1);
      pages.push('ellipsis');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('ellipsis');
      for (let i = page - 1; i <= page + 1; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (pageDisplay: string | number) => {
    const newPage = typeof pageDisplay === 'string' ? Number(pageDisplay) : pageDisplay;
    if (newPage >= 1 && newPage <= totalPages) {
      update({ page: newPage });
    }
  };

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <Pagination className={cn('mb-4 items-center justify-between gap-2 px-4', className)}>
      <div className='flex items-center gap-2'>
        {!shotMode ? (
          <p className='text-gray-600'>จำนวนต่อหน้า:</p>
        ) : (
          <p className='text-gray-600'> จำนวนต่อหน้า:</p>
        )}
        <Select
          value={`${limit}`}
          onValueChange={(value) => {
            if (!value) {
              return;
            }
            update({ limit: Number(value), page: 1 });
          }}
        >
          <SelectTrigger className='w-[70px] rounded-xl'>
            <SelectValue placeholder={limitOptions[0]} />
          </SelectTrigger>
          <SelectContent>
            {limitOptions.map((l) => (
              <SelectItem
                key={`limit-option-${l}`}
                value={String(l)}
              >
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={cn(
              'size-10 rounded-xl p-2 hover:bg-gray-300',
              page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            )}
            onClick={() => {
              handlePageChange(page - 1);
            }}
          />
        </PaginationItem>

        {getPageNumbers().map((pageDisplay) => (
          <PaginationItem key={`pagination-item-${crypto.randomUUID()}`}>
            {pageDisplay === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                className='size-9 cursor-pointer rounded-xl hover:bg-gray-300'
                isActive={page === pageDisplay}
                onClick={() => {
                  handlePageChange(pageDisplay);
                }}
              >
                {pageDisplay}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            className={cn(
              'size-10 rounded-xl p-2 hover:bg-gray-300',
              page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            )}
            onClick={() => {
              handlePageChange(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
export default ContentPagination;
