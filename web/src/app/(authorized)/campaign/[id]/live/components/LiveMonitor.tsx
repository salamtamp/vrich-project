'use client';

import React from 'react';

import { RefreshCw } from 'lucide-react';

import ListItem, { type TextData } from '@/components/list-item';
import PostModal from '@/components/modal/post-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useModalContext from '@/hooks/useContext/useModalContext';
// removed tabs usage per requirement: use custom buttons instead

type LiveMonitorProps = {
  items: TextData[];
};

const LiveMonitor: React.FC<LiveMonitorProps> = ({ items }) => {
  const { open: openModal } = useModalContext();
  const [activeTab, setActiveTab] = React.useState<'live' | 'messenger' | 'others'>('live');

  const handleSelectPost = () => {
    openModal({
      content: <PostModal />,
    });
  };

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
        <Button
          variant='outline'
          onClick={handleSelectPost}
        >
          เลือกโพสต์
        </Button>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='outline'
          >
            <RefreshCw className='size-4' />
          </Button>
          <Badge className='border-emerald-200 bg-emerald-50 text-emerald-700'>LIVE</Badge>
        </div>
      </div>

      {activeTab === 'live' && (
        <div className='mt-2 flex-1 overflow-y-auto pr-2'>
          {items.map((item) => (
            <ListItem
              key={item.id}
              data={item}
            />
          ))}
        </div>
      )}

      {activeTab === 'messenger' && <div className='p-4 text-sm text-gray-600'>ยังไม่มีข้อมูล</div>}

      {activeTab === 'others' && <div className='p-4 text-sm text-gray-600'>ยังไม่มีข้อมูล</div>}
    </div>
  );
};

export default LiveMonitor;
