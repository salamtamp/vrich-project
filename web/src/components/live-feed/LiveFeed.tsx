import { useEffect, useRef } from 'react';

import { User } from 'lucide-react';

import { ImageWithFallback } from '@/hooks/useImageFallback';
import type { FacebookProfileResponse } from '@/types/api/facebook-profile';

export type TimelineItem = { id: string; source: 'inbox' | 'comment'; text: string; timestamp: string };

import styles from './LiveFeed.module.scss';

export type LiveFeedProps = {
  profile: FacebookProfileResponse | undefined | null;
  timeline: TimelineItem[];
  onLoadMore?: () => void;
  hasNext?: boolean;
  platform?: 'all' | 'messenger' | 'fb_comments' | 'line_oa';
  isLoadingMore?: boolean;
};

const LiveFeed = ({
  profile,
  timeline,
  onLoadMore,
  hasNext = false,
  platform = 'all',
  isLoadingMore = false,
}: LiveFeedProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const isLoadingOlderRef = useRef<boolean>(false);
  const firstMessageRef = useRef<HTMLDivElement>(null);

  const messages = timeline
    .filter((m) => {
      if (platform === 'messenger') {
        return m.source === 'inbox';
      }
      if (platform === 'fb_comments') {
        return m.source === 'comment';
      }
      return true;
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

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
              const isMe = false; // In a live feed, messages are usually from others.
              return (
                <div
                  key={`${msg.source}-${msg.id}`}
                  ref={index === 0 ? firstMessageRef : null}
                  className={`flex gap-4 ${isMe ? 'justify-end' : 'justify-start'}`}
                  data-message-index={index}
                >
                  {!isMe && (
                    <ImageWithFallback
                      alt={profile?.name ?? 'profile'}
                      className='size-9 rounded-full object-cover'
                      size={36}
                      src={profile?.profile_picture_url}
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
