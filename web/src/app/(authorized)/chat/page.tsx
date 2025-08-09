'use client';

import { useCallback, useState } from 'react';

import type { FacebookInboxResponse } from '@/types/api';

import ChatContent from './chatContent';
import ChatProfile from './chatProfile';
import ChatProfileList from './chatProfileList';
import { mockInboxes } from './mock';
import SelectPlatform from './selectPlatform';

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
        <SelectPlatform
          selectedPlatform={selectedPlatform}
          onSelect={handleSelectPlatform}
        />
      </div>
      <div className={styles.main}>
        <ChatProfileList
          inboxes={mockInboxes}
          selectedInput={selectedInput}
          onSelect={handleSetSelectedInput}
        />
        <ChatContent selectedInput={selectedInput} />
        <ChatProfile profile={selectedInput?.profile} />
      </div>
    </div>
  );
};

export default Chat;
