import { useEffect, useRef, useState } from 'react';

import { AudioLines, ChevronUp, Clock, Ellipsis, FileImage, Send, User } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { ImageWithFallback } from '@/hooks/useImageFallback';
import type { FacebookProfileResponse } from '@/types/api/facebook-profile';

type TimelineItem = {
  id: string;
  source: 'inbox' | 'comment';
  text: string;
  timestamp: string;
  profile_picture_url?: string;
  profile_name?: string;
};

import styles from './Chat.module.scss';

export type ChatProps = {
  profile: FacebookProfileResponse | undefined | null;
  timeline: TimelineItem[];
  onLoadMore?: () => void;
  hasNext?: boolean;
  platform?: 'all' | 'messenger' | 'fb_comments' | 'line_oa';
  isLoadingMore?: boolean;
};

const Chat = ({
  profile,
  timeline,
  onLoadMore,
  hasNext = false,
  platform = 'all',
  isLoadingMore = false,
}: ChatProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const isLoadingOlderRef = useRef<boolean>(false);
  const firstMessageRef = useRef<HTMLDivElement>(null);
  const topVisibleMessageRef = useRef<{ id: string; offsetTop: number } | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

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

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setShowScrollToBottom(!isNearBottom && messages.length > 0);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'auto',
      });
    }
  };

  // Function to save the topmost visible message before loading older messages
  const saveTopVisibleMessage = () => {
    if (!messagesContainerRef.current) {
      return;
    }

    const container = messagesContainerRef.current;
    const containerTop = container.scrollTop;
    const messageElements = container.querySelectorAll('[data-message-id]');

    // Find the first visible message (which will be one of the oldest currently loaded)
    for (const element of messageElements) {
      const htmlElement = element as HTMLElement;
      const elementTop = htmlElement.offsetTop - container.offsetTop;

      if (elementTop >= containerTop) {
        const messageId = element.getAttribute('data-message-id');
        if (messageId) {
          topVisibleMessageRef.current = {
            id: messageId,
            offsetTop: elementTop - containerTop, // Relative position from container top
          };
        }
        break;
      }
    }
  };

  // Function to scroll to the previously saved topmost message
  const scrollToSavedMessage = () => {
    if (!messagesContainerRef.current || !topVisibleMessageRef.current) {
      return;
    }

    const container = messagesContainerRef.current;
    const targetElement = container.querySelector(`[data-message-id="${topVisibleMessageRef.current.id}"]`);

    if (targetElement) {
      const htmlElement = targetElement as HTMLElement;
      const newScrollTop =
        htmlElement.offsetTop - container.offsetTop - topVisibleMessageRef.current.offsetTop;
      container.scrollTop = Math.max(0, newScrollTop);
    }

    // Clear the saved reference
    topVisibleMessageRef.current = null;
  };

  const handleLoadMore = () => {
    if (onLoadMore) {
      // Save the current topmost visible message before loading older messages
      saveTopVisibleMessage();
      isLoadingOlderRef.current = true;
      onLoadMore();
    }
  };

  useEffect(() => {
    if (messages.length > 0 && !hasInitialLoad) {
      setHasInitialLoad(true);
    }
  }, [messages.length, hasInitialLoad]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const prevLength = prevMessagesLengthRef.current;
      const currentLength = messages.length;

      if (currentLength > prevLength) {
        if (isLoadingOlderRef.current) {
          // Older messages were loaded at the beginning of the array
          // Use requestAnimationFrame to ensure DOM is updated
          requestAnimationFrame(() => {
            scrollToSavedMessage();
            isLoadingOlderRef.current = false;
          });
        } else {
          // New messages added to the bottom (newest), scroll to bottom
          container.scrollTop = container.scrollHeight;
        }
      }

      prevMessagesLengthRef.current = currentLength;
    }
  }, [messages.length]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'just now';
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    }
    return date.toLocaleDateString();
  };

  return (
    <section
      aria-label='Chat content'
      className={`${styles.content} relative bg-gradient-to-br from-slate-50 via-white to-blue-50/30`}
    >
      {/* Chat Header */}
      <div className={styles.contentHeader}>
        <div className='ml-[2px]'>
          <ImageWithFallback
            alt={profile?.name ?? 'profile'}
            className={`${styles.profileImage} rounded-full object-cover shadow-sm ring-2 ring-white`}
            fallbackIcon={<User className='size-6 text-slate-500' />}
            size={40}
            src={profile?.profile_picture_url}
          />
        </div>
        <div className='gap-2'>
          <p className='text-md-semibold text-slate-700'>{profile?.name ?? 'Unknown User'}</p>
          <p className='text-sm-regular text-slate-500'>online</p>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className='flex-1 space-y-4 overflow-y-auto p-4'
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent',
        }}
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className='flex h-full flex-col items-center justify-center py-16 text-center'>
            <div className='mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200'>
              <Send className='size-8 text-slate-400' />
            </div>
            <p className='text-lg font-medium text-slate-500'>No messages yet</p>
          </div>
        ) : (
          <>
            {hasNext ? (
              <div className='flex justify-center py-4'>
                <button
                  className='group relative overflow-hidden rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'
                  disabled={isLoadingMore}
                  onClick={handleLoadMore}
                >
                  <div className='absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 transition-opacity duration-200 group-hover:opacity-100' />
                  <div className='relative flex items-center gap-2'>
                    {isLoadingMore ? (
                      <>
                        <div className='size-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500' />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronUp className='size-4' />
                        Load More Messages
                      </>
                    )}
                  </div>
                </button>
              </div>
            ) : null}

            {messages.map((msg, index) => {
              const isMe = false; // You can implement your own logic here
              const messageId = `${msg.source}-${msg.id}`;

              return (
                <div
                  key={messageId}
                  ref={index === 0 ? firstMessageRef : null}
                  className={`group flex gap-4 ${isMe ? 'justify-end' : 'justify-start'}`}
                  data-message-id={messageId}
                  data-message-index={index}
                >
                  {!isMe && (
                    <ImageWithFallback
                      alt={msg.profile_name ?? profile?.name ?? 'profile'}
                      className='size-10 rounded-full object-cover shadow-sm ring-2 ring-white transition-transform duration-200 group-hover:scale-105'
                      fallbackIcon={<User className='size-6 text-slate-500' />}
                      size={40}
                      src={msg.profile_picture_url ?? profile?.profile_picture_url}
                    />
                  )}

                  <div className={`flex max-w-[80%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* Message Header */}
                    <div className={`mb-1 flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className='text-sm font-medium text-slate-700'>
                        {msg.profile_name ?? profile?.name ?? 'Unknown User'}
                      </span>
                      {msg.timestamp ? (
                        <div className='flex items-center gap-1 text-xs text-slate-500'>
                          <Clock className='size-3' />
                          {formatTime(msg.timestamp)}
                        </div>
                      ) : null}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`relative rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 group-hover:shadow-md ${
                        isMe
                          ? 'rounded-br-md bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                      }`}
                    >
                      {!isMe && (
                        <div className='absolute -left-2 top-4 size-0 border-r-8 border-t-8 border-r-white border-t-transparent' />
                      )}
                      {isMe && (
                        <div className='absolute -right-2 top-4 size-0 border-l-8 border-t-8 border-l-blue-500 border-t-transparent' />
                      )}

                      <p className='whitespace-pre-wrap text-sm leading-relaxed'>
                        {msg.text || 'No message content'}
                      </p>
                    </div>
                  </div>

                  {isMe && (
                    <ImageWithFallback
                      alt='You'
                      className='size-10 rounded-full object-cover shadow-sm ring-2 ring-white transition-transform duration-200 group-hover:scale-105'
                      fallbackIcon={<User className='size-6 text-slate-500' />}
                      size={40}
                      src='/assets/icon/profile-male.svg'
                    />
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollToBottom ? (
        <button
          className='absolute bottom-20 right-4 flex size-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-slate-50 hover:shadow-xl'
          onClick={scrollToBottom}
        >
          <ChevronUp className='size-5 rotate-180' />
        </button>
      ) : null}

      {/* Input Message Box */}
      <div className={styles.inputMessage}>
        <div>
          <AudioLines
            className='text-slate-600'
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
            className='text-slate-600'
            size={20}
          />
        </div>
        <div>
          <Ellipsis
            className='text-slate-600'
            size={20}
          />
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </section>
  );
};

export default Chat;
