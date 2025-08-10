'use client';

import React, { useCallback, useState } from 'react';

import Chat from '@/components/chat/Chat';
import LiveFeed from '@/components/live-feed/LiveFeed';
import { LiveToggle } from '@/components/live-toggle';
import PostModal from '@/components/modal/post-modal';
import { Button } from '@/components/ui/button';
import useModalContext from '@/hooks/useContext/useModalContext';
import type { FacebookPostResponse } from '@/types/api';
// removed tabs usage per requirement: use custom buttons instead

const LiveMonitor = () => {
  const { open: openModal, close: closeModal } = useModalContext();
  const [post, setPost] = useState<FacebookPostResponse | null>(null);

  const [activeTab, setActiveTab] = React.useState<'live' | 'messenger' | 'others'>('live');

  const handleSelectPost = useCallback(
    (post: FacebookPostResponse) => {
      setPost(post);
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

  // const liveItems: TextData[] = useMemo(() => {
  //   const src = (campaign?.campaigns_products ?? []).slice(0, 8);
  //   return src.map((cp) => ({
  //     id: cp.product?.id ?? cp.id,
  //     text: cp.product?.name ?? '-',
  //     name: cp.product?.code,
  //     timeAgo: dayjsUtil(campaign?.created_at ?? new Date().toISOString()).fromNow(),
  //     dateString: dayjsUtil(campaign?.created_at ?? new Date().toISOString()).format('D MMM BBBB HH:mm'),
  //   }));
  // }, [campaign?.campaigns_products, campaign?.created_at]);

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
            platform='fb_comments'
            profile={null}
            timeline={[]}
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
