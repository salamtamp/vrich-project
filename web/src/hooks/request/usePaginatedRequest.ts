import { useCallback, useEffect, useState } from 'react';

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
};

function usePaginatedRequest<T, D = object>({
  url,
  order = 'desc',
  orderBy = 'created_at',
  defaultStartDate = dayjs().subtract(6, 'day'),
  defaultEndDate = dayjs(),
}: UsePaginatedRequestProps) {
  const { pagination } = usePaginationContext();
  const { limit, offset } = pagination;

  const [since, setSince] = useState<string | null>(defaultStartDate.startOf('day').toISOString());
  const [until, setUntil] = useState<string | null>(defaultEndDate.endOf('day').toISOString());

  const handleConfirm = useCallback((startDate: Dayjs | null, endDate: Dayjs | null) => {
    setSince(startDate ? startDate.startOf('day').toISOString() : null);
    setUntil(endDate ? endDate.endOf('day').toISOString() : null);
  }, []);

  const { data, error, headers, isLoading, handleRequest, cancelToken } = useRequest<T, D>({
    request: {
      url,
      params: {
        order,
        order_by: orderBy,
      },
    },
  });

  useEffect(() => {
    void handleRequest({ params: { offset, limit, since, until } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset, since, until]);

  return {
    data,
    error,
    headers,
    isLoading,
    handleRequest,
    cancelToken,
    since,
    until,
    handleConfirm,
    setSince,
    setUntil,
    limit,
    offset,
  };
}

export default usePaginatedRequest;
