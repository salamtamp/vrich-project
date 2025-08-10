import { useCallback, useState } from 'react';

import type { TimelineItem } from '@/components/live-feed/LiveFeed';

import useRequest from './useRequest';

type TimelineResponse = {
  docs: TimelineItem[];
  limit: number;
  offset: number;
  has_next: boolean;
};

type UseTimelineProps = {
  url: string;
  limit?: number;
  type?: 'fb_comments' | 'messenger';
  waiting?: boolean;
};

export const useTimeline = ({ url, limit = 20, type }: UseTimelineProps) => {
  const { handleRequest: fetchTimeline, isLoading } = useRequest<TimelineResponse>({
    request: { url, method: 'GET' },
    disableFullscreenLoading: true,
  });

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
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
        const newDocs = res.docs.filter((d) => !curr.find((c) => c.id === d.id && c.source === d.source));
        return isLoadMore ? [...newDocs, ...curr] : res.docs;
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
