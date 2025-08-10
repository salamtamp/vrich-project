'use client';

import React, { useCallback, useEffect, useState } from 'react';

import type { TimelineItem } from '@/components/live-feed/LiveFeed';
import LiveFeed from '@/components/live-feed/LiveFeed';
import { LiveToggle } from '@/components/live-toggle';
import PostModal from '@/components/modal/post-modal';
import { Button } from '@/components/ui/button';
import { API } from '@/constants/api.constant';
import { useTimeline } from '@/hooks/request/useTimeline';
import useModalContext from '@/hooks/useContext/useModalContext';
import type { FacebookCommentResponse, FacebookPostResponse } from '@/types/api';

const LiveMonitor = () => {
  const { open: openModal, close: closeModal } = useModalContext();
  const [post, setPost] = useState<FacebookPostResponse | null>(null);
  const [activeTab, setActiveTab] = React.useState<'live' | 'messenger' | 'others'>('live');

  const { timeline, isLoading, hasNext, loadTimeline, resetTimeline } = useTimeline<TimelineItem>({
    url: post ? `${API.POST}/${post.id}/timeline` : '',
    waiting: !post,
    type: 'fb_comments',
  });

  const {
    timeline: commentTimeline,
    isLoading: commentIsLoading,
    hasNext: commentHasNext,
    loadTimeline: commentLoadTimeline,
    resetTimeline: commentResetTimeline,
  } = useTimeline<FacebookCommentResponse>({
    url: API.COMMENT,
    type: 'messenger',
  });

  useEffect(() => {
    if (post?.id) {
      resetTimeline();
      void loadTimeline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id, resetTimeline]);

  useEffect(() => {
    if (activeTab === 'messenger') {
      commentResetTimeline();
      void commentLoadTimeline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSelectPost = useCallback(
    (selectedPost: FacebookPostResponse) => {
      setPost(selectedPost);
      closeModal('select-post-modal');

      if (post?.id === selectedPost.id) {
        resetTimeline();
        void loadTimeline();
      }
    },
    [closeModal, loadTimeline, post?.id, resetTimeline]
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
          disabled
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

      {activeTab === 'live' && (
        <>
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
          <div className='flex-1 overflow-hidden pt-2'>
            <LiveFeed
              hasNext={hasNext}
              isLoadingMore={isLoading}
              timeline={timeline}
              onLoadMore={() => {
                void loadTimeline(true);
              }}
            />
          </div>
        </>
      )}

      {activeTab === 'messenger' && (
        <div className='flex-1 overflow-hidden pt-4'>
          <LiveFeed
            hasNext={commentHasNext}
            isLoadingMore={commentIsLoading}
            timeline={commentTimeline}
            onLoadMore={() => {
              void commentLoadTimeline(true);
            }}
          />
        </div>
      )}

      {activeTab === 'others' && <div className='p-4 text-sm text-gray-600'>ยังไม่มีข้อมูล</div>}
    </div>
  );
};

export default LiveMonitor;
