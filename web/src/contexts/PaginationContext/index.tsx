'use client';

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  limit: 15,
  isLoading: false,
  sortBy: 'updated_at',
  order: 'DESC',
};

export const PaginationContext = createContext<PaginationContextType | null>(null);

type PaginationProviderProps = NextJSChildren & {
  defaultValue?: Partial<Omit<Pagination, 'offset' | 'isDisableNext' | 'isDisablePrev'>>;
};

export const PaginationProvider: FC<PaginationProviderProps> = ({ children, defaultValue }) => {
  const initialPaginationRef = useRef({ ...defaultPagination, ...defaultValue });
  const [pagination, setPagination] = useState(initialPaginationRef.current);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPagination({ ...defaultPagination, ...defaultValue });
    setReady(true);
  }, [defaultValue]);

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

  if (!ready) {
    return null;
  }

  return <PaginationContext.Provider value={value}>{children}</PaginationContext.Provider>;
};
