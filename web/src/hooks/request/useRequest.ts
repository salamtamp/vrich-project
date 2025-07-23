'use client';

import { useCallback, useEffect, useState } from 'react';

import type { AxiosError, AxiosRequestConfig, AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';
import axios from 'axios';
import { useSession } from 'next-auth/react';

import { useLoading } from '@/contexts';
import axiosClient from '@/lib/axios/axiosClient';

export type UseRequestProps<T> = {
  request: AxiosRequestConfig;
  afterRequest?: (data?: T) => unknown;
  defaultLoading?: boolean;
};

export type UpdateRequest = {
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
  data?: AxiosRequestConfig['data'];
  patchId?: string;
};

type RequestState<T, D> = {
  data: T | null;
  headers: RawAxiosResponseHeaders | AxiosResponseHeaders | null;
  error: AxiosError<D> | null;
  isLoading: boolean;
};

const useRequest = <T, D = object>({ request, afterRequest, defaultLoading = false }: UseRequestProps<T>) => {
  const { data: session } = useSession();
  const [requestState, setRequestState] = useState<RequestState<T, D>>({
    data: null,
    headers: null,
    error: null,
    isLoading: defaultLoading,
  });

  const { openLoading, closeLoading } = useLoading();

  const { data, headers, error, isLoading } = requestState;

  const onRequest = useCallback(
    async (updateRequest?: UpdateRequest) => {
      try {
        setRequestState({
          data: null,
          headers: null,
          error: null,
          isLoading: true,
        });

        const isFormData = request.data instanceof FormData || updateRequest?.data instanceof FormData;

        const requestHeaders: AxiosRequestConfig['headers'] = {
          ...request.headers,
          ...(updateRequest?.headers ?? {}),
        };

        if (session?.accessToken) {
          requestHeaders.Authorization = `Bearer ${session.accessToken}`;
        }

        const requestParams: AxiosRequestConfig['params'] = {
          ...request.params,
          ...(updateRequest?.params ?? {}),
        };

        let requestUrl: AxiosRequestConfig['url'] = updateRequest?.patchId
          ? `${request.url}/${updateRequest.patchId}`
          : request.url;

        if (requestParams) {
          requestUrl = `${requestUrl}/`;
        }

        const updatedRequest = {
          ...request,
          url: requestUrl,
          headers: requestHeaders,
          params: requestParams,
          data: isFormData
            ? (updateRequest?.data ?? request.data)
            : { ...request.data, ...(updateRequest?.data ?? {}) },
        };

        const response = await axiosClient<T>(updatedRequest);

        setRequestState({
          data: response.data,
          headers: response.headers,
          error: null,
          isLoading: false,
        });

        return response.data;
      } catch (err) {
        if (axios.isCancel(err)) {
          setRequestState((c) => ({ ...c, isLoading: false }));
          return null as T;
        }

        if (axios.isAxiosError(err)) {
          const serverError = {
            ...err,
            message: 'Internal Server Error',
            code: 'ERR_INTERNAL_SERVER',
          };

          setRequestState({
            data: null,
            headers: null,
            error: serverError,
            isLoading: false,
          });
          throw serverError;
        }

        setRequestState({
          data: null,
          headers: null,
          error,
          isLoading: false,
        });
        throw err;
      }
    },
    [error, request, session?.accessToken]
  );

  const handleRequest = useCallback(
    async (updateRequest?: UpdateRequest) => {
      const data = await onRequest(updateRequest);

      await afterRequest?.(data);

      return data;
    },
    [afterRequest, onRequest]
  );

  useEffect(() => {
    if (isLoading) {
      openLoading();
    } else {
      closeLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return { data, error, headers, isLoading, handleRequest };
};

export default useRequest;
