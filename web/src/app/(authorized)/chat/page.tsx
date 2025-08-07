'use client';

import { useCallback, useState } from 'react';

import { AudioLines, Ellipsis, FileImage, Send } from 'lucide-react';
import { Search, User } from 'lucide-react';

import { ButtonBox } from '@/components/ui';

import { ProfileSection } from '@/components/profile-box';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageWithFallback } from '@/hooks/useImageFallback';
import { cn } from '@/lib/utils';
import type { FacebookInboxResponse } from '@/types/api';

import { mockInboxes } from './mock';

import styles from './page.module.scss';

const Chat = () => {
  type PlatformType = 'all' | 'messenger' | 'fb_comments' | 'line_oa';

  const [selectedInput, setSelectedInput] = useState<FacebookInboxResponse | null>(mockInboxes[0]);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('all');

  const handleSetSelectedInput = useCallback((inbox: FacebookInboxResponse) => {
    setSelectedInput(inbox);
  }, []);

  const handleSelectPlatform = useCallback((platform: PlatformType) => {
    setSelectedPlatform(platform);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.title}>Chat</p>
        <p className={styles.subtitle}>Respond to messages, set up automations and more</p>
      </div>

      <div className='mx-2 mt-4 flex h-20'>
        <div className={styles.selectPlatformContainer}>
          <Button
            variant={selectedPlatform === 'all' ? 'default' : 'outline'}
            onClick={() => {
              handleSelectPlatform('all');
            }}
          >
            All Messages
          </Button>
          <Button
            variant={selectedPlatform === 'messenger' ? 'default' : 'outline'}
            onClick={() => {
              handleSelectPlatform('messenger');
            }}
          >
            Messenger
          </Button>
          <Button
            variant={selectedPlatform === 'fb_comments' ? 'default' : 'outline'}
            onClick={() => {
              handleSelectPlatform('fb_comments');
            }}
          >
            FB Comments
          </Button>
        </div>
      </div>

      <div className={styles.main}>
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

          <div className='flex h-full flex-col gap-2 overflow-y-auto'>
            {mockInboxes.map((inbox) => {
              const isSelected = selectedInput?.id === inbox.id;
              return (
                <ButtonBox
                  key={inbox.id}
                  className={cn('w-full', styles.inboxItem, isSelected && styles.isSelected)}
                  onClick={() => {
                    handleSetSelectedInput(inbox);
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
                </ButtonBox>
              );
            })}
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <div className='ml-[2px]'>
              <ImageWithFallback
                alt={selectedInput?.profile?.name ?? 'profile'}
                className={styles.profileImage}
                fallbackIcon={<User size={24} />}
                size={40}
                src={selectedInput?.profile?.profile_picture_url}
              />
            </div>
            <div className='gap-2'>
              <p className='text-md-semibold'>{selectedInput?.profile?.name ?? 'Unknown User'}</p>
              <p className='text-sm-regular text-gray-600'>online</p>
            </div>
          </div>
          <div className='w-full flex-1 p-[18px]'>
            <div className='flex gap-4'>
              <ImageWithFallback
                alt={selectedInput?.profile?.name ?? 'profile'}
                className='size-9 rounded-full object-cover'
                size={36}
                src={selectedInput?.profile?.profile_picture_url}
                fallbackIcon={
                  <User
                    className='text-gray-400'
                    size={36}
                  />
                }
              />
              <div className='flex w-full flex-col'>
                <p className='w-full text-xs-semibold text-gray-500'>Today, 10:15AM</p>
                <div className='w-fit max-w-[80%] rounded-t-lg rounded-br-lg bg-gray-200 px-4 py-2'>
                  <p>{selectedInput?.message}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.inputMessage}>
            <div>
              <AudioLines
                className='text-gray-600'
                size={20}
              />
            </div>
            <Input
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
        </div>

        {selectedInput?.profile ? <ProfileSection profile={selectedInput.profile} /> : null}
      </div>
    </div>
  );
};

export default Chat;
