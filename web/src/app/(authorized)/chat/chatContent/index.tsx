import { useEffect, useRef } from 'react';

import { AudioLines, Ellipsis, FileImage, Send, User } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { ImageWithFallback } from '@/hooks/useImageFallback';
import type { FacebookProfileResponse } from '@/types/api/facebook-profile';

type TimelineItem = { id: string; source: 'inbox' | 'comment'; text: string; timestamp: string };

import styles from './chatContent.module.scss';

type ChatContentProps = {
  profile: FacebookProfileResponse | undefined | null;
  timeline: TimelineItem[];
  onLoadMore?: () => void;
  hasNext?: boolean;
  platform?: 'all' | 'messenger' | 'fb_comments' | 'line_oa';
  isLoadingMore?: boolean;
};

const ChatContent = ({
  profile,
  timeline,
  onLoadMore,
  hasNext = false,
  platform = 'all',
  isLoadingMore = false,
}: ChatContentProps) => {
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

  // Auto-scroll to bottom only when new messages are added (not when loading older ones)
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const prevLength = prevMessagesLengthRef.current;
      const currentLength = messages.length;

      if (currentLength > prevLength) {
        if (isLoadingOlderRef.current) {
          // Loading older messages - scroll to the old first message (now at position 5)
          requestAnimationFrame(() => {
            if (firstMessageRef.current) {
              // Scroll to the old first message (which is now at index 5 after 5 new messages)
              const oldFirstMessageIndex = 5; // 5 new messages were added
              const messageElements = container.querySelectorAll('[data-message-index]');
              if (messageElements[oldFirstMessageIndex]) {
                const targetElement = messageElements[oldFirstMessageIndex] as HTMLElement;
                container.scrollTop = targetElement.offsetTop - container.offsetTop - 20; // 20px padding
              }
            }
            isLoadingOlderRef.current = false;
          });
        } else {
          // New messages added - scroll to bottom
          container.scrollTop = container.scrollHeight;
        }
      }

      prevMessagesLengthRef.current = currentLength;
    }
  }, [messages.length]);

  return (
    <section
      aria-label='Chat content'
      className={styles.content}
    >
      <div className={styles.contentHeader}>
        <div className='ml-[2px]'>
          <ImageWithFallback
            alt={profile?.name ?? 'profile'}
            className={styles.profileImage}
            fallbackIcon={<User size={24} />}
            size={40}
            src={profile?.profile_picture_url}
          />
        </div>
        <div className='gap-2'>
          <p className='text-md-semibold'>{profile?.name ?? 'Unknown User'}</p>
          <p className='text-sm-regular text-gray-600'>online</p>
        </div>
      </div>
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
                      className={`${
                        isMe ? 'rounded-bl-lg bg-blue-200 text-blue-900' : 'rounded-br-lg bg-gray-200'
                      } rounded-t-lg px-4 py-2`}
                    >
                      <p>{msg.text}</p>
                    </div>
                  </div>
                  {isMe ? (
                    <ImageWithFallback
                      alt='You'
                      className='size-9 rounded-full object-cover'
                      size={36}
                      src='/assets/icon/profile-male.svg'
                      fallbackIcon={
                        <User
                          className='text-gray-400'
                          size={36}
                        />
                      }
                    />
                  ) : null}
                </div>
              );
            })}
          </>
        )}
      </div>
      <div className={styles.inputMessage}>
        <div>
          <AudioLines
            className='text-gray-600'
            size={20}
          />
        </div>
        <Input
          aria-label='Type a message'
          className='flex-1'
          placeholder='Type something...'
        />
        <div>
          <Send
            className='text-blue-600'
            size={20}
          />
        </div>
        <div>
          <FileImage
            className='text-gray-600'
            size={20}
          />
        </div>
        <div>
          <Ellipsis
            className='text-gray-600'
            size={20}
          />
        </div>
      </div>
    </section>
  );
};

export default ChatContent;
