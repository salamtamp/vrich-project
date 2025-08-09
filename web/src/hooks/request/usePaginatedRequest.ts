'use client';

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
  disableLimit?: boolean;
};

function usePaginatedRequest<T, D = object>({
  url,
  order = 'desc',
  orderBy = 'published_at',
  defaultStartDate = dayjs().subtract(1, 'month'),
  defaultEndDate = dayjs(),
  additionalParams = {},
  requireFields = [],
  waiting = false,
  disableLimit,
}: UsePaginatedRequestProps) {
  const { pagination, reset } = usePaginationContext();
  const { limit: limitPagination, offset } = pagination;

  const limit = disableLimit ? undefined : limitPagination;

  const [since, setSince] = useState<string | null>(defaultStartDate.startOf('day').toISOString());
  const [until, setUntil] = useState<string | null>(defaultEndDate.endOf('day').toISOString());
  const [resetting, setResetting] = useState(false);

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

  const handleConfirmPeriod = useCallback((startDate: Dayjs | null, endDate: Dayjs | null) => {
    setSince(startDate ? startDate.startOf('day').toISOString() : null);
    setUntil(endDate ? endDate.endOf('day').toISOString() : null);
  }, []);

  const handleResetToDefault = useCallback(() => {
    setResetting(true);
    reset();
    setSince(defaultStartDate.startOf('day').toISOString());
    setUntil(defaultEndDate.endOf('day').toISOString());

    const newParams = {
      offset,
      limit,
      since: defaultStartDate.startOf('day').toISOString(),
      until: defaultEndDate.endOf('day').toISOString(),
      ...additionalParams,
    };

    void handleRequest({ params: newParams });
    setResetting(false);
  }, [reset, defaultStartDate, defaultEndDate, offset, limit, additionalParams, handleRequest]);

  // Extract complex expressions for useEffect dependencies
  const requireFieldsString = JSON.stringify(requireFields);
  const additionalParamsString = JSON.stringify(additionalParams);

  useEffect(() => {
    if (resetting) {
      return;
    }

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
  }, [limit, offset, since, until, requireFieldsString, additionalParamsString, waiting, resetting]);

  return {
    data,
    error,
    headers,
    isLoading,
    handleRequest,
    since,
    until,
    handleConfirmPeriod,
    handleResetToDefault,
    setSince,
    setUntil,
    limit,
    offset,
  };
}

export default usePaginatedRequest;
