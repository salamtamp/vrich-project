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
  disableFullscreenLoading?: boolean;
  searchBy?: string;
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
  disableFullscreenLoading = false,
  searchBy = 'name',
}: UsePaginatedRequestProps) {
  const { pagination, reset } = usePaginationContext();
  const { limit: limitPagination, offset, search } = pagination;

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
    disableFullscreenLoading,
  });

  const handleConfirmPeriod = useCallback((startDate: Dayjs | null, endDate: Dayjs | null) => {
    setSince(startDate ? startDate.startOf('day').toISOString() : null);
    setUntil(endDate ? endDate.endOf('day').toISOString() : null);
  }, []);

  const handleResetToDefault = useCallback(() => {
    setResetting(true);
    reset();
    const resetSince = defaultStartDate.startOf('day').toISOString();
    const resetUntil = defaultEndDate.endOf('day').toISOString();
    setSince(resetSince);
    setUntil(resetUntil);

    const newParams = {
      offset: 0,
      limit,
      since: resetSince,
      until: resetUntil,
      search: '',
      search_by: searchBy,
      ...additionalParams,
    };

    void handleRequest({ params: newParams });
    setResetting(false);
  }, [reset, defaultStartDate, defaultEndDate, limit, searchBy, additionalParams, handleRequest]);

  const requireFieldsString = JSON.stringify(requireFields);
  const additionalParamsString = JSON.stringify(additionalParams);

  useEffect(() => {
    if (resetting) {
      return;
    }

    const newParams = { offset, limit, since, until, search, search_by: searchBy, ...additionalParams };
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
  }, [limit, offset, since, until, search, requireFieldsString, additionalParamsString, waiting, resetting]);

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
