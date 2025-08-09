import { Search, User } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { ImageWithFallback } from '@/hooks/useImageFallback';
import { cn } from '@/lib/utils';

import type { ChatListItem } from '../types';

import styles from './chatProfileList.module.scss';

type ChatProfileListProps = {
  items: ChatListItem[];
  selectedItem: ChatListItem | null;
  onSelect: (item: ChatListItem) => void;
  onLoadMore?: () => void;
  hasNext?: boolean;
};

const ChatProfileList = ({
  items,
  selectedItem,
  onSelect,
  onLoadMore,
  hasNext = false,
}: ChatProfileListProps) => (
  <nav aria-label='Chat list'>
    <div className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <Input
          placeholder='search for ...'
          leftIcon={
            <Search
              className={styles.icon}
              size={14}
            />
          }
        />
      </div>
      <hr className={styles.divider} />
      <ul
        className='flex flex-1 flex-col overflow-y-auto'
        role='listbox'
        onScroll={(e) => {
          const el = e.currentTarget as HTMLUListElement;
          if (hasNext && el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
            onLoadMore?.();
          }
        }}
      >
        {items.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          return (
            <li
              key={`${item.source}-${item.id}`}
              aria-selected={isSelected}
              className={cn('w-full', styles.inboxItem, isSelected && styles.isSelected)}
              role='option'
              tabIndex={0}
              onClick={() => {
                onSelect(item);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelect(item);
                }
              }}
            >
              <div
                key={`${item.profile?.profile_picture_url}-${item.profile?.name}`}
                className='w-fit min-w-6'
              >
                <ImageWithFallback
                  alt={item.profile?.name ?? 'profile'}
                  className={styles.profileImage}
                  fallbackIcon={<User size={24} />}
                  size={40}
                  src={item.profile?.profile_picture_url}
                />
              </div>
              <div className='flex flex-1 flex-col'>
                <p className={styles.inboxName}>{item.profile?.name}</p>
                <p className={styles.inboxMessage}> {item.message}</p>
              </div>
              {item.notificationCount ? (
                <div className='flex h-full w-7 items-center justify-center'>
                  <div className='size-6 max-h-full max-w-full items-center justify-center rounded-lg border-red-500 bg-red-200 text-sm-regular text-red-600'>
                    1
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  </nav>
);

export default ChatProfileList;
