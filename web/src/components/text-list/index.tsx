import { useEffect, useState } from 'react';

import { ProfileMaleIcon } from '@public/assets/icon';
import { Trash } from 'lucide-react';

import usePaginationContext from '@/hooks/useContext/usePaginationContext';
import { cn } from '@/lib/utils';

import type { CardData } from '../card';
import ContentPagination from '../content/pagination';
import ListItem from '../list-item';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

import { MockInbox, MockPost } from './mock';

type TextListProps = {
  id?: string;
  cardData?: CardData;
  defaultTab?: 'comment' | 'inbox';
};

const TextList: React.FC<TextListProps> = ({ cardData, defaultTab = 'comment' }) => {
  const [selectAbleMode, setSelectAbleMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [tab, setTab] = useState<string>(defaultTab);

  const { update, reset } = usePaginationContext();

  let mockData = MockPost;
  if (tab === 'comment') {
    mockData = MockPost;
  }
  if (tab === 'inbox') {
    mockData = MockInbox;
  }

  const allItemIds = mockData.map((i) => i.id) || [];
  const isSelectAll = allItemIds.length && selectedItems.length && allItemIds.length === selectedItems.length;

  const { title } = cardData ?? {};

  useEffect(() => {
    update({ limit: 20 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <div className='flex h-[540px] w-full max-w-full flex-col sm:w-[400px] md:w-[660px]'>
      <div className='mr-10 flex justify-between overflow-hidden'>
        <div className='flex items-center gap-2'>
          <ProfileMaleIcon />
          <p className='text-display-medium'>{title}</p>
        </div>

        <div className='flex items-center gap-2'>
          {selectAbleMode ? (
            <>
              <Button
                className='px-[10px] py-[2px] text-gray-600 transition-colors hover:border-red-200 hover:bg-red-100 hover:text-red-400'
                disabled={!selectedItems.length}
                variant='outline'
              >
                <Trash />
              </Button>
              <Button
                variant='outline'
                className={
                  (cn('px-[10px] py-[2px] text-gray-600 transition-colors'),
                  isSelectAll ? 'border-blue-300' : '')
                }
                onClick={() => {
                  if (isSelectAll) {
                    setSelectedItems([]);
                    return;
                  }
                  setSelectedItems(allItemIds);
                }}
              >
                <p>Select All</p>
              </Button>
            </>
          ) : null}

          <Button
            variant='outline'
            className={cn(
              'px-[10px] py-[2px] text-gray-600 transition-colors',
              selectAbleMode && 'border-blue-300',
              'hidden'
            )}
            onClick={() => {
              if (allItemIds) {
                setSelectedItems([]);
              }
              setSelectAbleMode((prev) => !prev);
            }}
          >
            <p>Select</p>
          </Button>
        </div>
      </div>

      <Tabs
        className='mt-2'
        defaultValue='comment'
        value={tab}
        onValueChange={(newTab) => {
          setTab(newTab);
        }}
      >
        <TabsList className='bg-gray-300'>
          <TabsTrigger value='comment'>Comment</TabsTrigger>
          <TabsTrigger value='inbox'>Inbox</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className='mt-2 h-[2px] w-full rounded-xl bg-gray-300' />

      <div className='mt-2 flex h-full flex-1 flex-col overflow-scroll'>
        {mockData?.map((t) => {
          const isSelected = selectedItems.includes(t.id);
          return (
            <ListItem
              key={t.id}
              data={t}
              isSelected={isSelected}
              selectAbleMode={selectAbleMode}
            />
          );
        })}
      </div>

      <ContentPagination
        className='mt-2'
        limitOptions={[20, 40, 100, 200]}
        total={40}
      />
    </div>
  );
};

export default TextList;
