import { useCallback, useEffect, useState } from 'react';

import type { AxiosRequestConfig } from 'axios';
import type { Dayjs } from 'dayjs';

import dayjs from '@/lib/dayjs';

import usePaginationContext from '../useContext/usePaginationContext';

import useRequest from './useRequest';

type UsePaginatedRequestProps = {
  url: string;
  order?: string;
  orderBy?: string;
  defaultStartDate?: Dayjs;
  defaultEndDate?: Dayjs;
  additionalParams?: AxiosRequestConfig['params'];
  requireFields?: string[];
  waiting?: boolean;
};

function usePaginatedRequest<T, D = object>({
  url,
  order = 'desc',
  orderBy = 'published_at',
  defaultStartDate = dayjs().subtract(6, 'day'),
  defaultEndDate = dayjs(),
  additionalParams = {},
  requireFields = [],
  waiting = false,
}: UsePaginatedRequestProps) {
  const { pagination } = usePaginationContext();
  const { limit, offset } = pagination;

  const [since, setSince] = useState<string | null>(defaultStartDate.startOf('day').toISOString());
  const [until, setUntil] = useState<string | null>(defaultEndDate.endOf('day').toISOString());

  const handleConfirmPeriod = useCallback((startDate: Dayjs | null, endDate: Dayjs | null) => {
    setSince(startDate ? startDate.startOf('day').toISOString() : null);
    setUntil(endDate ? endDate.endOf('day').toISOString() : null);
  }, []);

  const { data, error, headers, isLoading, handleRequest } = useRequest<T, D>({
    request: {
      url,
      params: {
        order,
        order_by: orderBy,
        ...additionalParams,
      },
    },
  });

  useEffect(() => {
    const newParams = { offset, limit, since, until, ...additionalParams };
    if (waiting) {
      return;
    }

    for (const requireField of requireFields) {
      if (requireField && !newParams[requireField]) {
        return;
      }
    }

    void handleRequest({ params: newParams });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset, since, until, JSON.stringify(requireFields), JSON.stringify(additionalParams), waiting]);

  return {
    data,
    error,
    headers,
    isLoading,
    handleRequest,
    since,
    until,
    handleConfirmPeriod,
    setSince,
    setUntil,
    limit,
    offset,
  };
}

export default usePaginatedRequest;
