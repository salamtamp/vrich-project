'use client';

import React, { useEffect, useState } from 'react';

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
};

const ContentPagination: React.FC<ContentPaginationProps> = ({ className, total = 0, limitOptions = [] }) => {
  const { update, pagination, reset } = usePaginationContext();
  const { limit } = pagination;

  const totalPages = Math.ceil(total / limit);

  const [currentPage, setCurrentPage] = useState(1);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push('ellipsis');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('ellipsis');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (pageDispley: string | number) => {
    const newPage = typeof pageDispley === 'string' ? Number(pageDispley) : pageDispley;
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      update({ page: newPage });
    }
  };

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <Pagination className={cn('items-center justify-between gap-2', className)}>
      <div className='flex items-center gap-2'>
        <p> Results per page:</p>
        <Select>
          <SelectTrigger className='w-[70px] rounded-xl'>
            <SelectValue placeholder='12' />
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
              currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            )}
            onClick={() => {
              handlePageChange(currentPage - 1);
            }}
          />
        </PaginationItem>

        {getPageNumbers().map((pageDispley) => (
          <PaginationItem key={`pagination-item-${crypto.randomUUID()}`}>
            {pageDispley === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                className='size-9 cursor-pointer rounded-xl hover:bg-gray-300'
                isActive={currentPage === pageDispley}
                onClick={() => {
                  handlePageChange(pageDispley);
                }}
              >
                {pageDispley}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            className={cn(
              'size-10 rounded-xl p-2 hover:bg-gray-300',
              currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            )}
            onClick={() => {
              handlePageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
export default ContentPagination;
