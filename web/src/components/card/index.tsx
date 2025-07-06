'use client';

import React from 'react';

import { ProfileMaleIcon } from '@public/assets/icon';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { Checkbox } from '../ui/checkbox';

import styles from './card.module.scss';

export type CardProps = {
  isSelectMode?: boolean;
  isSelected?: boolean;
  cardData: CardData;
};

export type CardData = { id: string; title: string; content?: ReactNode; lastUpdate: string };

const Card: React.FC<CardProps> = ({ isSelected = false, isSelectMode = false, cardData }) => {
  return (
    <div className='flex w-full'>
      <div className={cn(styles.cardContent)}>
        <div className='flex items-center gap-2'>
          {isSelectMode ? (
            <Checkbox
              checked={isSelected}
              // eslint-disable-next-line tailwindcss/enforces-negative-arbitrary-values
              className='-mt-[1px]'
            />
          ) : null}
          <p className={styles.cardName}>{cardData.title} </p>
        </div>
        <div className={styles.cardText}>{cardData.content}</div>
      </div>
      <div className={styles.cardRight}>
        <div className={styles.cardAvatar}>
          <ProfileMaleIcon />
        </div>
        <p className={styles.cardTime}>{cardData.lastUpdate}</p>
      </div>
    </div>
  );
};

export default Card;
