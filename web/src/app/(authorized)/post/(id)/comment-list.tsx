/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import dayjs from 'dayjs';
import { ExternalLink, User } from 'lucide-react';

import type { CardData } from '@/components/card';
import SkeletonCard from '@/components/card/SkeletonCard';
import ProfileBox from '@/components/profile-box';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { API } from '@/constants/api.constant';
import { PaginationProvider, useLoadingEffect } from '@/contexts';
import useRequest from '@/hooks/request/useRequest';
import { useSocketList } from '@/hooks/request/useSocketList';
import useModalContext from '@/hooks/useContext/useModalContext';
import { ImageWithFallback, useImageWithFallback } from '@/hooks/useImageFallback';
import { useLocalDocsWithProfileUpdate } from '@/hooks/useLocalDocsWithProfileUpdate';
import { cn, getRelativeTimeInThai } from '@/lib/utils';
import type { FacebookInboxResponse } from '@/types/api/facebook-inbox';

type CommentListProps = {
  onCheckedChange?: (checked: boolean) => void;
  image?: string;
  name?: string;
  link?: string;
  status?: 'active' | 'inactive';
};

const isValidImageUrl = (url?: string): url is string => {
  return !!url && /^https?:\/\//.test(url) && !url.includes('example.com');
};

const CommentList: React.FC<CommentListProps> = ({ onCheckedChange, image, name, link, status }) => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const {
    items: comments,
    isLoading,
    loadMore,
    hasNext,
    reset,
  } = useSocketList<FacebookInboxResponse>({
    requestConfig: { url: API.COMMENT, method: 'GET', params: { post_id: id } },
    socketEventName: id ? `facebook_post.${id}.new_comment` : undefined,
  });

  const { openLoading, closeLoading } = useLoadingEffect({ isLoading });

  const { handleRequest: handlePostRequest } = useRequest({
    request: { url: `${API.POST}/${id}`, method: 'PUT' },
  });

  const { open, close } = useModalContext();
  const { imgLoading } = useImageWithFallback();
  const [postStatus, setPostStatus] = useState(status);
  const [showNewItemButton, setShowNewItemButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const newCommentRef = useRef<HTMLDivElement>(null);
  const prevCommentsLength = useRef<number>(0);

  const {
    updated: updatedComments,
    markProfileUpdated,
    handleProfileUpdateIfNeeded,
  } = useLocalDocsWithProfileUpdate<FacebookInboxResponse>(
    comments,
    (item) => item.profile?.id,
    (item, profile) =>
      item.profile
        ? {
            ...item,
            profile: {
              ...item.profile,
              name: profile.name,
              profile_picture_url: profile.profile_picture_url ?? item.profile.profile_picture_url,
            },
          }
        : item
  );

  const isAtTop = () => {
    const container = containerRef.current;
    if (!container) {
      return true;
    }
    return container.scrollTop <= 10;
  };

  // Handle scroll event to hide button when new comment comes into view
  const handleScroll = useCallback(() => {
    if (showNewItemButton && newCommentRef.current && containerRef.current) {
      const container = containerRef.current;
      const newComment = newCommentRef.current;

      const containerRect = container.getBoundingClientRect();
      const newCommentRect = newComment.getBoundingClientRect();

      // Check if the new comment is visible in the container
      const isVisible = newCommentRect.top >= containerRect.top && newCommentRect.top <= containerRect.bottom;

      if (isVisible) {
        setShowNewItemButton(false);
      }
    }
  }, [showNewItemButton]);

  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  useEffect(() => {
    if (comments.length === prevCommentsLength.current + 1) {
      if (!isAtTop()) {
        setShowNewItemButton(true);
      } else {
        containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    prevCommentsLength.current = comments.length;
  }, [comments.length]);

  const handleScrollToNew = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setShowNewItemButton(false);
  };

  const handleCardClick = useCallback(
    (id: string, data: CardData) => {
      open({
        content: (
          <PaginationProvider defaultValue={{ limit: 20 }}>
            <ProfileBox
              cardData={data}
              id={id}
              onUpdate={markProfileUpdated}
            />
          </PaginationProvider>
        ),
        onClose: () => {
          handleProfileUpdateIfNeeded();
          close();
        },
      });
    },
    [open, close, markProfileUpdated, handleProfileUpdateIfNeeded]
  );

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      try {
        openLoading();
        void handlePostRequest({ data: { status: checked ? 'active' : 'inactive' } });
        setPostStatus(checked ? 'active' : 'inactive');
        onCheckedChange?.(checked);
      } catch (error) {
        console.error(error);
      } finally {
        closeLoading();
      }
    },
    [closeLoading, handlePostRequest, onCheckedChange, openLoading]
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
              <ImageWithFallback
                alt={name ?? 'post-image'}
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
            <p className='truncate text-display-medium'>{name ?? ''}</p>
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

      <div
        ref={containerRef}
        className='flex h-full flex-1 flex-col overflow-y-scroll'
      >
        {showNewItemButton ? (
          <div className='sticky top-0 z-10 flex justify-center'>
            <button
              className='animate-fade-in my-2 rounded-full bg-green-500 px-4 py-2 text-white shadow transition-all hover:bg-green-600'
              onClick={handleScrollToNew}
            >
              New comment! Click to view
            </button>
          </div>
        ) : null}

        {updatedComments.map((m: FacebookInboxResponse, index: number) => {
          const card: CardData = {
            id: m.profile?.id ?? '',
            name: m.profile?.name ?? '',
            lastUpdate: getRelativeTimeInThai(m.published_at),
            profile_picture_url: m.profile?.profile_picture_url,
          };

          return (
            <div
              key={`${m.id}-${crypto.randomUUID()}`}
              ref={index === 0 ? newCommentRef : null}
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
        {isLoading ? <div className='flex justify-center py-4'>Loading...</div> : null}
        {hasNext && !isLoading ? (
          <button
            className='mx-auto my-4 rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300'
            onClick={() => {
              void loadMore();
            }}
          >
            Load More
          </button>
        ) : null}
      </div>
    </>
  );
};

export default CommentList;
