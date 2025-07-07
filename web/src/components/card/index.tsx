'use client';

import React from 'react';

import Image from 'next/image';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import mockLogo from '../../../public/assets/image/logo.png';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';

import styles from './card.module.scss';

export type CardProps = {
  isSelectMode?: boolean;
  isSelected?: boolean;
  cardData: CardData;
};

export type CardData = {
  id: string;
  title?: string;
  content?: ReactNode;
  isLiveMode?: boolean;
  lastUpdate: string;
};

const Card: React.FC<CardProps> = ({ isSelected = false, isSelectMode = false, cardData }) => {
  return (
    <div className='flex w-full gap-2'>
      <div className={cn(styles.cardContent)}>
        <div className='flex items-center gap-2'>
          {isSelectMode ? (
            <Checkbox
              checked={isSelected}
              // eslint-disable-next-line tailwindcss/enforces-negative-arbitrary-values
              className='-mt-[1px]'
            />
          ) : null}
          {cardData?.title ? <p className={styles.cardName}>{cardData.title} </p> : ''}{' '}
          <div className='flex h-full items-start pt-[2px]'>
            {cardData?.isLiveMode ? <Badge className='bg-green-200 text-green-800'>Live</Badge> : null}
          </div>
        </div>
        <div className={styles.cardText}>{cardData.content}</div>
      </div>
      <div className={styles.cardRight}>
        <div className={styles.cardAvatar}>
          <Image
            alt='logo'
            height={40}
            src={mockLogo}
            width={40}
          />
        </div>
        <p className={styles.cardTime}>{cardData.lastUpdate}</p>
      </div>
    </div>
  );
};

export default Card;
