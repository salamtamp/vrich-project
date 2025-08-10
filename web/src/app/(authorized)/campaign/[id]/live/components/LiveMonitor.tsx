'use client';

import React, { useCallback, useEffect, useState } from 'react';

import Chat from '@/components/chat/Chat';
import LiveFeed, { type TimelineItem } from '@/components/live-feed/LiveFeed';
import { LiveToggle } from '@/components/live-toggle';
import PostModal from '@/components/modal/post-modal';
import { Button } from '@/components/ui/button';
import { API } from '@/constants/api.constant';
import useRequest from '@/hooks/request/useRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import type { FacebookPostResponse } from '@/types/api';

type TimelineResponse = {
  total: number;
  docs: TimelineItem[];
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
  timestamp: string;
};

const LiveMonitor = () => {
  const { open: openModal, close: closeModal } = useModalContext();
  const [post, setPost] = useState<FacebookPostResponse | null>(null);
  const [activeTab, setActiveTab] = React.useState<'live' | 'messenger' | 'others'>('live');

  const { handleRequest: fetchTimeline, isLoading: isTimelineLoading } = useRequest<TimelineResponse>({
    request: { url: post ? `${API.POST}/${post.id}/timeline` : '', method: 'GET' },
    disableFullscreenLoading: true,
  });

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [timelineOffset, setTimelineOffset] = useState(0);
  const [timelineHasNext, setTimelineHasNext] = useState(false);

  const loadTimeline = useCallback(
    async (reset = false) => {
      if (!post) {
        return;
      }
      const nextOffset = reset ? 0 : timelineOffset;

      const res = await fetchTimeline({
        params: { offset: nextOffset, limit: 20, type: 'fb_comments' },
      });

      if (!res) {
        return;
      }
      setTimeline((curr) => {
        if (reset) {
          return res.docs;
        }
        const existingKeys = new Set(curr.map((d) => `${d.source}-${d.id}`));
        const newDocs = res.docs.filter((d) => !existingKeys.has(`${d.source}-${d.id}`));
        return [...newDocs, ...curr]; // Prepend new docs to the beginning
      });
      setTimelineOffset(nextOffset + (res.limit ?? 0));
      setTimelineHasNext(res.has_next ?? false);
    },
    [fetchTimeline, post, timelineOffset]
  );

  useEffect(() => {
    if (post?.id) {
      setTimeline([]);
      setTimelineOffset(0);
      setTimelineHasNext(false);
      void loadTimeline(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  const handleSelectPost = useCallback(
    (selectedPost: FacebookPostResponse) => {
      setPost(selectedPost);
      closeModal('select-post-modal');
    },
    [closeModal]
  );

  const handleOpenSelectPostModal = useCallback(() => {
    openModal({
      key: 'select-post-modal',
      content: <PostModal onSelectPost={handleSelectPost} />,
    });
  }, [handleSelectPost, openModal]);

  return (
    <div className='flex max-h-[520px] min-h-[520px] flex-1 flex-col overflow-hidden rounded-md border border-gray-200 p-4 shadow-sm'>
      <div className='flex w-full items-center justify-start gap-2'>
        <Button
          aria-pressed={activeTab === 'live'}
          size='sm'
          variant={activeTab === 'live' ? 'softgray' : 'ghost'}
          onClick={() => {
            setActiveTab('live');
          }}
        >
          Live Video
        </Button>
        <Button
          aria-pressed={activeTab === 'messenger'}
          size='sm'
          variant={activeTab === 'messenger' ? 'softgray' : 'ghost'}
          onClick={() => {
            setActiveTab('messenger');
          }}
        >
          Messenger
        </Button>
        <Button
          aria-pressed={activeTab === 'others'}
          size='sm'
          variant={activeTab === 'others' ? 'softgray' : 'ghost'}
          onClick={() => {
            setActiveTab('others');
          }}
        >
          Others
        </Button>
      </div>
      <div className='mt-2 flex w-full items-center justify-between gap-2'>
        <div>
          <p className='narrow max-w-[220px] truncate'>{post?.message}</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={handleOpenSelectPostModal}
          >
            เลือกโพสต์
          </Button>
          <LiveToggle disabled={!post} />
        </div>
      </div>

      {activeTab === 'live' && (
        <div className='flex-1 overflow-hidden pt-2'>
          <LiveFeed
            hasNext={timelineHasNext}
            isLoadingMore={isTimelineLoading}
            platform='fb_comments'
            profile={post?.profile}
            timeline={timeline}
            onLoadMore={() => {
              void loadTimeline(false);
            }}
          />
        </div>
      )}

      {activeTab === 'messenger' && (
        <div className='flex-1 overflow-hidden pt-4'>
          <Chat
            platform='messenger'
            profile={null}
            timeline={[]}
          />
        </div>
      )}

      {activeTab === 'others' && <div className='p-4 text-sm text-gray-600'>ยังไม่มีข้อมูล</div>}
    </div>
  );
};

export default LiveMonitor;
