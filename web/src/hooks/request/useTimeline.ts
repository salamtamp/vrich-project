import { useCallback, useState } from 'react';

import type { PaginationResponse } from '@/types/api';

import useRequest from './useRequest';

type UseTimelineProps = {
  url: string;
  limit?: number;
  type?: 'fb_comments' | 'messenger';
  waiting?: boolean;
};

export const useTimeline = <T>({ url, limit = 20, type }: UseTimelineProps) => {
  const { handleRequest: fetchTimeline, isLoading } = useRequest<PaginationResponse<T>>({
    request: { url, method: 'GET' },
    disableFullscreenLoading: true,
  });

  const [timeline, setTimeline] = useState<T[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const loadTimeline = useCallback(
    async (isLoadMore = false) => {
      const currentOffset = isLoadMore ? offset : 0;
      const res = await fetchTimeline({ params: { offset: currentOffset, limit, type } });

      if (!res) {
        return;
      }

      setTimeline((curr) => {
        const newDocs = res.docs.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (d: any) => !curr.find((c: any) => c.id === d.id)
        );
        return isLoadMore ? [...newDocs.reverse(), ...curr] : res.docs.reverse();
      });
      setOffset(currentOffset + res.limit);
      setHasNext(res.has_next);
    },
    [fetchTimeline, limit, offset, type]
  );

  const resetTimeline = useCallback(() => {
    setTimeline([]);
    setOffset(0);
    setHasNext(false);
  }, []);

  return {
    timeline,
    isLoading,
    hasNext,
    loadTimeline,
    resetTimeline,
  };
};
