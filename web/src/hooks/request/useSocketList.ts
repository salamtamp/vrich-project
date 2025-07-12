import { useCallback, useEffect, useState } from 'react';

import { useSocketContext } from '@/contexts';

import useRequest from './useRequest';

export type UseSocketListOptions<_T> = {
  requestConfig: Parameters<typeof useRequest>[0]['request'];
  socketEventName?: string;
  limit?: number;
};

export function useSocketList<_T>({ requestConfig, socketEventName, limit = 20 }: UseSocketListOptions<_T>) {
  const { socket } = useSocketContext();

  const [items, setItems] = useState<_T[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const { isLoading, handleRequest } = useRequest<{ docs: _T[]; has_next: boolean }>({
    request: requestConfig,
  });

  const stringifiedRequestConfig = JSON.stringify(requestConfig);

  const loadMore = useCallback(async () => {
    const res = await handleRequest({ params: { ...requestConfig.params, offset: items.length, limit } });
    if (res?.docs) {
      setItems((prev) => [...prev, ...res.docs]);
      setHasNext(!!res.has_next);
    }
  }, [handleRequest, items.length, limit, requestConfig.params]);

  const reset = useCallback(() => {
    setItems([]);
    setHasNext(false);
  }, []);

  useEffect(() => {
    if (!socket || !socketEventName) {
      return;
    }
    const handleNewItem = (item: _T) => {
      setItems((prev) => [item, ...prev]);
    };
    socket.on(socketEventName, handleNewItem);
    return () => {
      socket.off(socketEventName, handleNewItem);
    };
  }, [socketEventName, socket]);

  useEffect(() => {
    setItems([]);
    void (async () => {
      const res = await handleRequest({ params: { ...requestConfig.params, offset: 0, limit } });
      if (res?.docs) {
        setItems(res.docs);
        setHasNext(!!res.has_next);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringifiedRequestConfig]);

  return {
    items,
    isLoading,
    loadMore,
    hasNext,
    reset,
  };
}

export default useSocketList;
