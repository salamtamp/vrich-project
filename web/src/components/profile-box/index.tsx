import { useEffect, useMemo, useState } from 'react';

import { Check, Edit2, Trash, X } from 'lucide-react';

import { API } from '@/constants/api.constant';
import { useLoading } from '@/contexts';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
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
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../ui/toast';

type TextListProps = {
  id?: string;
  cardData?: CardData;
  defaultTab?: 'comment' | 'inbox';
  onUpdate?: (profile: { id: string; name: string; profile_picture_url?: string }) => void;
};

const ProfileBox: React.FC<TextListProps> = ({ cardData, defaultTab = 'comment', onUpdate }) => {
  const [selectAbleMode, setSelectAbleMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [tab, setTab] = useState<string>(defaultTab);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(cardData?.name ?? '');
  const [localName, setLocalName] = useState(cardData?.name ?? '');

  const { reset } = usePaginationContext();
  const { showToast } = useToast();

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

  const { handleRequest: updateProfile, isLoading: isUpdating } = useRequest<{ name: string }>({
    request: {
      url: `${API.PROFILE}/${cardData?.id}`,
      method: 'PUT',
      data: { name: editedName },
    },
    defaultLoading: false,
  });

  useEffect(() => {
    setEditedName(cardData?.name ?? '');
    setLocalName(cardData?.name ?? '');
  }, [cardData?.name]);

  const data = tab === 'comment' ? commentData : inboxData;

  const allItemIds = data?.docs.map((i) => i.id) ?? [];
  const isSelectAll = allItemIds.length && selectedItems.length && allItemIds.length === selectedItems.length;

  const { profile_picture_url } = cardData ?? {};

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
        <div className='flex items-center gap-4'>
          <ImageWithFallback
            alt='profile'
            className='size-10'
            size={40}
            src={profile_picture_url}
          />
          {editMode ? (
            <>
              <Input
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                className='w-fit text-display-medium'
                disabled={isUpdating}
                value={editedName}
                onChange={(e) => {
                  setEditedName(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isUpdating && editedName.trim()) {
                    void (async () => {
                      const res = await updateProfile({ data: { name: editedName } });
                      if (res?.name ?? false) {
                        setLocalName(res.name);
                        setEditedName(res.name);
                        showToast(<p>Name updated successfully</p>, { duration: 2000 });
                        onUpdate?.({
                          id: cardData?.id ?? '',
                          name: res.name,
                          profile_picture_url: cardData?.profile_picture_url,
                        });
                      }
                      setEditMode(false);
                    })();
                  }
                }}
              />
              <div className='flex gap-1'>
                <Button
                  className='border-green-300 p-2 text-green-500 hover:bg-green-200'
                  disabled={isUpdating || !editedName.trim()}
                  variant='outline'
                  onClick={() => {
                    void (async () => {
                      const res = await updateProfile({ data: { name: editedName } });
                      if (res?.name ?? false) {
                        setLocalName(res.name);
                        setEditedName(res.name);
                        showToast(<p>Name updated successfully</p>, { duration: 2000 });
                        onUpdate?.({
                          id: cardData?.id ?? '',
                          name: res.name,
                          profile_picture_url: cardData?.profile_picture_url,
                        });
                      }
                      setEditMode(false);
                    })();
                  }}
                >
                  <Check size={18} />
                </Button>
                <Button
                  className='border-red-300 p-2 text-red-500 hover:bg-red-200'
                  disabled={isUpdating}
                  variant='outline'
                  onClick={() => {
                    setEditedName(localName ?? '');
                    setEditMode(false);
                  }}
                >
                  <X size={18} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className='truncate text-display-medium'>{localName}</p>
              <Button
                className='px-3 py-2'
                variant='outline'
                onClick={() => {
                  setEditMode(true);
                }}
              >
                <Edit2 size={18} />
              </Button>
            </>
          )}
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

export default ProfileBox;
