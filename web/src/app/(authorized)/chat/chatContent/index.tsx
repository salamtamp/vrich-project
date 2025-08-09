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
};

const ChatContent = ({ profile, timeline, onLoadMore, hasNext = false }: ChatContentProps) => {
  const messages = timeline;

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
        className='flex w-full flex-1 flex-col gap-4 overflow-y-auto p-[18px]'
        onScroll={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          if (hasNext && el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
            onLoadMore?.();
          }
        }}
      >
        {messages.length === 0 ? (
          <div className='text-center text-gray-400'>No messages</div>
        ) : (
          messages.map((msg) => {
            const isMe = false;
            return (
              <div
                key={`${msg.source}-${msg.id}`}
                className={`flex gap-4 ${isMe ? 'justify-end' : 'justify-start'}`}
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
          })
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
