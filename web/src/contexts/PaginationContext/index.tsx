'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import type { FC } from 'react';

import type { NextJSChildren } from '@/types';

type Pagination = {
  page: number;
  offset: number;
  total: number;
  limit: number;
  sortBy: string;
  order: 'ASC' | 'DESC';
  isLoading: boolean;
  isDisableNext: boolean;
  isDisablePrev: boolean;
};

export type UpdatePagination = Partial<Omit<Pagination, 'offset'>>;

type PaginationContextType = {
  pagination: Pagination;
  set: (pagination: Pagination) => void;
  update: (pagination: UpdatePagination) => void;
  reset: () => void;
};

const defaultPagination: Omit<Pagination, 'offset' | 'isDisableNext' | 'isDisablePrev'> = {
  page: 1,
  total: 0,
  limit: 12,
  isLoading: false,
  sortBy: 'updated_at',
  order: 'DESC',
};

export const PaginationContext = createContext<PaginationContextType | null>(null);

export const PaginationProvider: FC<NextJSChildren> = ({ children }) => {
  const [pagination, setPagination] = useState(defaultPagination);
  const [isCollapse, setIsCollapse] = useState<boolean | null>(null);

  const offset = (pagination.page - 1) * pagination.limit;
  const isDisableNext = pagination.page * pagination.limit >= pagination.total;
  const isDisablePrev = pagination.page <= 1;

  const handleSetPagination = useCallback((setData: Pagination) => {
    setPagination(setData);
  }, []);

  const handleUpdatePagination = useCallback((updateData: UpdatePagination) => {
    setPagination((current) => ({ ...current, ...updateData }));
  }, []);

  const handleResetPagination = useCallback(() => {
    setPagination(defaultPagination);
  }, []);

  const value = useMemo(
    () => ({
      pagination: {
        ...pagination,
        offset,
        isDisableNext,
        isDisablePrev,
      },

      set: handleSetPagination,
      update: handleUpdatePagination,
      reset: handleResetPagination,
    }),
    [
      handleResetPagination,
      handleSetPagination,
      handleUpdatePagination,
      isDisableNext,
      isDisablePrev,
      offset,
      pagination,
    ]
  );

  useEffect(() => {
    const storedCollapse = localStorage.getItem('sidebar-collapse');
    if (storedCollapse !== null) {
      setIsCollapse(storedCollapse === 'true');
    }
  }, []);

  return (
    <PaginationContext.Provider value={value}>
      {isCollapse === null ? <></> : children}
    </PaginationContext.Provider>
  );
};
