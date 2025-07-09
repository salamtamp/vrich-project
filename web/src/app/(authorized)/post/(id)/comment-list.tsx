/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
'use client';

import { useCallback, useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import dayjs from 'dayjs';
import { ExternalLink, User } from 'lucide-react';

import type { CardData } from '@/components/card';
import SkeletonCard from '@/components/card/SkeletonCard';
import ContentPagination from '@/components/content/pagination';
import TextList from '@/components/text-list';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { API } from '@/constants/api.constant';
import { PaginationProvider, useLoading } from '@/contexts';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import usePaginationContext from '@/hooks/useContext/usePaginationContext';
import { ImageWithFallback, useImageWithFallback } from '@/hooks/useImageFallback';
import { cn, getRelativeTimeInThai } from '@/lib/utils';
import type { PaginationResponse } from '@/types/api/api-response';
import type { FacebookInboxResponse } from '@/types/api/facebook-inbox';

type CommentListProps = {
  onCheckedChange?: (checked: boolean) => void;
  image?: string;
  title?: string;
  link?: string;
  status?: 'active' | 'inactive';
};

const isValidImageUrl = (url?: string): url is string => {
  return !!url && /^https?:\/\//.test(url) && !url.includes('example.com');
};

const CommentList: React.FC<CommentListProps> = ({ onCheckedChange, image, title, link, status }) => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { reset } = usePaginationContext();
  const { openLoading, closeLoading } = useLoading();

  const { handleRequest } = useRequest({ request: { url: `${API.POST}/${id}`, method: 'PUT' } });

  const { data, isLoading } = usePaginatedRequest<PaginationResponse<FacebookInboxResponse>>({
    url: API.COMMENT,
    additionalParams: { post_id: id },
    requireFields: ['post_id'],
    defaultStartDate: dayjs().subtract(100, 'year'),
  });

  const { open } = useModalContext();
  const { imgLoading } = useImageWithFallback();
  const [postStatus, setPostStatus] = useState(status);

  const handleCardClick = useCallback(
    (id: string, data: CardData) => {
      open({
        content: (
          <PaginationProvider defaultValue={{ limit: 20 }}>
            <TextList
              cardData={data}
              id={id}
            />
          </PaginationProvider>
        ),
      });
    },
    [open]
  );

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      try {
        openLoading();
        void handleRequest({ data: { status: checked ? 'active' : 'inactive' } });
        setPostStatus(checked ? 'active' : 'inactive');
        onCheckedChange?.(checked);
      } catch (error) {
        console.error(error);
      } finally {
        closeLoading();
      }
    },
    [closeLoading, handleRequest, onCheckedChange, openLoading]
  );

  useEffect(() => {
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPostStatus(status === 'active' ? 'active' : 'inactive');
  }, [status, id]);

  useEffect(() => {
    if (isLoading) {
      openLoading();
    } else {
      closeLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <>
      <div className='flex w-full justify-between'>
        <div className='flex w-full items-center gap-4 pb-2'>
          {image ? (
            <div className='size-10 rounded-full bg-gray-300'>
              <ImageWithFallback
                alt={title ?? 'post-image'}
                className={imgLoading ? 'hidden' : ''}
                fallbackIcon={<User size={25} />}
                isValidImageUrl={isValidImageUrl}
                size={40}
                src={image}
                style={{ borderRadius: '50%' }}
              />
              {imgLoading ? <SkeletonCard avatarOnly /> : null}
            </div>
          ) : null}
          <div className='flex max-w-[260px]'>
            <p className='truncate text-display-medium'>{title ?? ''}</p>
          </div>
          {link ? (
            <Button
              className='px-3 py-2'
              variant='outline'
              onClick={() => {
                window.open(link, '_blank');
              }}
            >
              <ExternalLink />
            </Button>
          ) : null}
        </div>

        <div className='flex h-full w-fit items-center gap-2'>
          <p className='text-nowrap'>Live Mode</p>{' '}
          <Switch
            checked={postStatus === 'active'}
            className={cn(postStatus === 'active' && '!bg-green-400')}
            onCheckedChange={(checked) => {
              handleCheckedChange(checked);
            }}
          />
        </div>
      </div>
      <div className='mt-2 h-[2px] w-full rounded-xl bg-gray-100' />

      <div className='flex h-full flex-1 flex-col overflow-y-scroll'>
        {data?.docs?.map((m) => {
          const card: CardData = {
            id: m.profile?.id ?? '',
            title: m.profile?.name ?? '',
            lastUpdate: getRelativeTimeInThai(m.published_at),
          };

          return (
            <div
              key={`${m.messenger_id}-${crypto.randomUUID()}`}
              className='mx-2 my-4'
            >
              <div
                className='flex cursor-pointer justify-between gap-2 rounded-lg px-4 py-3 hover:bg-gray-200'
                onClick={() => {
                  handleCardClick(m.messenger_id, card);
                }}
              >
                <div className='flex flex-col gap-2'>
                  <p className='text-display-medium'>{m.profile?.name ?? ''}</p>
                  <p>{m.message}</p>
                </div>
                <div className='flex min-w-[100px] flex-col justify-between gap-1'>
                  <div className='flex w-full justify-end'>
                    <ImageWithFallback
                      alt={m.profile?.name ?? 'profile'}
                      className='size-8'
                      fallbackIcon={<User size={25} />}
                      size={32}
                      src={m.profile?.profile_picture_url}
                    />
                  </div>
                  <p className='line-clamp-1 flex justify-end text-sm-medium'>
                    {dayjs(m.published_at).format('YYYY-MM-DD HH:mm')}
                  </p>
                </div>
              </div>
              <div className='mt-2 h-[2px] w-full rounded-xl bg-gray-300' />
            </div>
          );
        })}
      </div>

      <ContentPagination
        shotMode
        className='mt-5'
        total={data?.total ?? 0}
      />
    </>
  );
};

export default CommentList;
