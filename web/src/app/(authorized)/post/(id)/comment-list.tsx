/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
'use client';

import { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { ProfileMaleIcon } from '@public/assets/icon';
import dayjs from 'dayjs';
import { ExternalLink, User } from 'lucide-react';

import type { CardData } from '@/components/card';
import SkeletonCard from '@/components/card/SkeletonCard';
import ContentPagination from '@/components/content/pagination';
import TextList from '@/components/text-list';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { API } from '@/constants/api.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import useRequest from '@/hooks/request/useRequest';
import useModalContext from '@/hooks/useContext/useModalContext';
import usePaginationContext from '@/hooks/useContext/usePaginationContext';
import useImageFallback from '@/hooks/useImageFallback';
import { cn, getRelativeTimeInThai } from '@/lib/utils';
import type { PaginationResponse } from '@/types/api/api-response';
import type { FacebookMessengerResponse } from '@/types/api/facebook-messenger';

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

  const { handleRequest } = useRequest({ request: { url: `${API.POST}/${id}`, method: 'PUT' } });

  const { data } = usePaginatedRequest<PaginationResponse<FacebookMessengerResponse>>({
    url: API.COMMENT,
    additionalParams: { post_id: id },
    requireFields: ['post_id'],
    defaultStartDate: dayjs().subtract(100, 'year'),
  });

  const { open } = useModalContext();
  const { showFallback, handleImgError } = useImageFallback();
  const [imgLoading, setImgLoading] = useState(false);
  const [postStatus, setPostStatus] = useState(status);

  const handleImgLoadStart = () => {
    setImgLoading(true);
  };
  const handleImgLoad = () => {
    setImgLoading(false);
  };

  const handleCardClick = useCallback(
    (id: string, data: CardData) => {
      open({
        content: (
          <TextList
            cardData={data}
            id={id}
          />
        ),
      });
    },
    [open]
  );

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      try {
        void handleRequest({ data: { status: checked ? 'active' : 'inactive' } });
        setPostStatus(checked ? 'active' : 'inactive');
        onCheckedChange?.(checked);
      } catch (error) {
        console.error(error);
      }
    },
    [handleRequest, onCheckedChange]
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

  return (
    <>
      <div className='flex w-full justify-between'>
        <div className='flex w-full items-center gap-4 pb-2'>
          {image ? (
            <div className='size-10 rounded-full bg-gray-300'>
              {!showFallback && isValidImageUrl(image) ? (
                <>
                  {imgLoading ? <SkeletonCard avatarOnly /> : null}
                  <Image
                    alt={title ?? 'post-image'}
                    className={imgLoading ? 'hidden' : ''}
                    height={40}
                    src={image}
                    style={{ borderRadius: '50%' }}
                    width={40}
                    onError={handleImgError}
                    onLoad={handleImgLoad}
                    onLoadStart={handleImgLoadStart}
                    onLoadingComplete={handleImgLoad}
                  />
                </>
              ) : (
                <div className='flex size-10 items-center justify-center rounded-full'>
                  <User size={25} />
                </div>
              )}
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
            id: m.messenger_id,
            title: m.profile?.name ?? 'Unknown',
            lastUpdate: getRelativeTimeInThai(m.created_at),
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
                  <p className='text-display-medium'>{m.profile?.name ?? 'Unknown'}</p>
                  <p>{m.message}</p>
                </div>
                <div className='flex min-w-[100px] flex-col justify-between gap-1'>
                  <div className='flex w-full justify-end'>
                    <ProfileMaleIcon />
                  </div>
                  <p className='line-clamp-1 flex justify-end text-sm-medium'>
                    {dayjs(m.created_at).format('YYYY-MM-DD HH:mm')}
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
