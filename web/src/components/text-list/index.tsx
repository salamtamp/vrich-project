import { useEffect, useMemo, useState } from 'react';

import { Trash } from 'lucide-react';

import { API } from '@/constants/api.constant';
import { useLoading } from '@/contexts';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import usePaginationContext from '@/hooks/useContext/usePaginationContext';
import { ImageWithFallback } from '@/hooks/useImageFallback';
import dayjs from '@/lib/dayjs';
import { cn, getRelativeTimeInThai } from '@/lib/utils';
import type { FacebookCommentResponse, FacebookInboxResponse } from '@/types/api';
import type { PaginationResponse } from '@/types/api/api-response';

import type { CardData } from '../card';
import ContentPagination from '../content/pagination';
import type { TextData } from '../list-item';
import ListItem from '../list-item';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

type TextListProps = {
  id?: string;
  cardData?: CardData;
  defaultTab?: 'comment' | 'inbox';
};

const TextList: React.FC<TextListProps> = ({ cardData, defaultTab = 'comment' }) => {
  const [selectAbleMode, setSelectAbleMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [tab, setTab] = useState<string>(defaultTab);

  const { reset } = usePaginationContext();

  const { data: commentData, isLoading: commentLoading } = usePaginatedRequest<
    PaginationResponse<FacebookCommentResponse>
  >({
    url: API.COMMENT,
    waiting: tab !== 'comment' && !!cardData?.id,
    defaultStartDate: dayjs().subtract(100, 'year'),
    additionalParams: { profile_id: cardData?.id },
    requireFields: ['profile_id'],
  });

  const { data: inboxData, isLoading: inboxLoading } = usePaginatedRequest<
    PaginationResponse<FacebookInboxResponse>
  >({
    url: API.INBOX,
    waiting: tab !== 'inbox' && !!cardData?.id,
    defaultStartDate: dayjs().subtract(100, 'year'),
    additionalParams: { profile_id: cardData?.id },
    requireFields: ['profile_id'],
  });

  const { openLoading, closeLoading } = useLoading();

  const data = tab === 'comment' ? commentData : inboxData;

  const allItemIds = data?.docs.map((i) => i.id) ?? [];
  const isSelectAll = allItemIds.length && selectedItems.length && allItemIds.length === selectedItems.length;

  const { title, profile_picture_url, name } = cardData ?? {};

  const isLoading = commentLoading || inboxLoading;

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const textData: TextData[] = useMemo(
    () =>
      (data?.docs ?? []).map((item) => {
        const publishedAt = item.published_at;
        const postUrl = 'post' in item && item.post ? (item.post.link ?? '') : '';
        return {
          id: item?.id,
          text: item.message ?? '',
          postUrl,
          profile_picture_url: item.profile?.profile_picture_url ?? '',
          name: item.profile?.name ?? '',
          timeAgo: publishedAt ? getRelativeTimeInThai(publishedAt) : '',
          dateString: publishedAt ? dayjs(publishedAt).format('DD/MM/BB HH:mm') : '',
        };
      }),
    [data?.docs]
  );

  useEffect(() => {
    if (isLoading) {
      openLoading();
    } else {
      closeLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <div className='flex h-[540px] w-full max-w-full flex-col sm:w-[400px] md:w-[660px]'>
      <div className='mr-10 flex justify-between overflow-hidden'>
        <div className='flex items-center gap-2'>
          <ImageWithFallback
            alt={name ?? 'profile'}
            className='size-10'
            size={40}
            src={profile_picture_url}
          />
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
        {textData?.map((t) => {
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
        total={data?.total}
      />
    </div>
  );
};

export default TextList;
