import { Search, User } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { ImageWithFallback } from '@/hooks/useImageFallback';
import { cn } from '@/lib/utils';
import type { FacebookInboxResponse } from '@/types/api/facebook-inbox';

import styles from './chatProfileList.module.scss';

type ChatProfileListProps = {
  inboxes: FacebookInboxResponse[];
  selectedInput: FacebookInboxResponse | null;
  onSelect: (inbox: FacebookInboxResponse) => void;
};

const ChatProfileList = ({ inboxes, selectedInput, onSelect }: ChatProfileListProps) => (
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
        className='flex h-full flex-col overflow-y-auto'
        role='listbox'
      >
        {inboxes.map((inbox) => {
          const isSelected = selectedInput?.id === inbox.id;
          return (
            <li
              key={inbox.id}
              aria-selected={isSelected}
              className={cn('w-full', styles.inboxItem, isSelected && styles.isSelected)}
              role='option'
              tabIndex={0}
              onClick={() => {
                onSelect(inbox);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelect(inbox);
                }
              }}
            >
              <div className='w-fit min-w-6'>
                <ImageWithFallback
                  alt={inbox.profile?.name ?? 'profile'}
                  className={styles.profileImage}
                  fallbackIcon={<User size={24} />}
                  size={40}
                  src={inbox.profile?.profile_picture_url}
                />
              </div>
              <div className='flex flex-1 flex-col'>
                <p className={styles.inboxName}>{inbox.profile?.name}</p>
                <p className={styles.inboxMessage}> {inbox.message}</p>
              </div>
              {inbox.notificationCount ? (
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
