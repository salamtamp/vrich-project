import { useEffect, useMemo, useRef } from 'react';

import { User } from 'lucide-react';

import { ImageWithFallback } from '@/hooks/useImageFallback';
import type { FacebookCommentResponse } from '@/types/api';

export type TimelineItem = {
  id: string;
  source: 'inbox' | 'comment';
  text: string;
  timestamp: string;
  profile_picture_url: string;
};

import styles from './LiveFeed.module.scss';

export type LiveFeedProps = {
  timeline: (TimelineItem | FacebookCommentResponse)[];
  onLoadMore?: () => void;
  hasNext?: boolean;
  isLoadingMore?: boolean;
};

const LiveFeed = ({ timeline, onLoadMore, hasNext = false, isLoadingMore = false }: LiveFeedProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const isLoadingOlderRef = useRef<boolean>(false);
  const firstMessageRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => {
    const normalized = timeline.map((item) => {
      if ('source' in item) {
        return item;
      }

      const comment = item;
      return {
        id: comment.id,
        source: 'comment',
        text: comment.message ?? '',
        timestamp: comment.published_at,
        profile_picture_url: comment.profile?.profile_picture_url ?? '',
      };
    });

    return normalized.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [timeline]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const prevLength = prevMessagesLengthRef.current;
      const currentLength = messages.length;

      if (currentLength > prevLength) {
        if (isLoadingOlderRef.current) {
          requestAnimationFrame(() => {
            if (firstMessageRef.current) {
              const oldFirstMessageIndex = 5;
              const messageElements = container.querySelectorAll('[data-message-index]');
              if (messageElements[oldFirstMessageIndex]) {
                const targetElement = messageElements[oldFirstMessageIndex] as HTMLElement;
                container.scrollTop = targetElement.offsetTop - container.offsetTop - 20;
              }
            }
            isLoadingOlderRef.current = false;
          });
        } else {
          container.scrollTop = container.scrollHeight;
        }
      }

      prevMessagesLengthRef.current = currentLength;
    }
  }, [messages.length]);

  return (
    <section
      aria-label='Live feed'
      className={styles.content}
    >
      <div
        ref={messagesContainerRef}
        className='flex w-full flex-1 flex-col gap-4 overflow-y-auto p-[18px]'
      >
        {messages.length === 0 ? (
          <div className='text-center text-gray-400'>No messages</div>
        ) : (
          <>
            {hasNext ? (
              <div className='flex justify-center py-4'>
                <button
                  className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                  disabled={isLoadingMore}
                  onClick={() => {
                    isLoadingOlderRef.current = true;
                    onLoadMore?.();
                  }}
                >
                  {isLoadingMore ? 'Loading...' : 'Load More Messages'}
                </button>
              </div>
            ) : null}
            {messages.map((msg, index) => {
              const isMe = false;
              return (
                <div
                  key={`${msg.source}-${msg.id}`}
                  ref={index === 0 ? firstMessageRef : null}
                  className={`flex gap-4 ${isMe ? 'justify-end' : 'justify-start'}`}
                  data-message-index={index}
                >
                  {!isMe && (
                    <ImageWithFallback
                      alt={msg.profile_picture_url ?? 'profile'}
                      className='size-9 rounded-full object-cover'
                      size={36}
                      src={msg?.profile_picture_url}
                      fallbackIcon={
                        <User
                          className='text-gray-400'
                          size={36}
                        />
                      }
                    />
                  )}
                  <div className={`flex w-full max-w-[80%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <p className='text-xs-semibold text-gray-500'>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                    </p>
                    <div
                      className={`${isMe ? 'rounded-bl-lg bg-blue-200 text-blue-900' : 'rounded-br-lg bg-gray-200'} rounded-t-lg px-4 py-2`}
                    >
                      <p>{msg.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </section>
  );
};

export default LiveFeed;
