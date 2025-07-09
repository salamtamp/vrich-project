'use client';

import React from 'react';

import type { ReactNode } from 'react';

import { ImageWithFallback } from '@/hooks/useImageFallback';
import { cn } from '@/lib/utils';

import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';

import SkeletonCard from './SkeletonCard';

import styles from './card.module.scss';

export type CardProps = {
  isSelectMode?: boolean;
  isSelected?: boolean;
  cardData: CardData;
  fallbackAvatar?: React.ReactNode;
  isLoading?: boolean;
  skeletonSize?: 'small' | 'medium' | 'large';
};

export type CardData = {
  id: string;
  title?: string;
  content?: ReactNode;
  status?: 'active' | 'inactive';
  lastUpdate: string;
  profile_picture_url?: string;
  name?: string;
};

const Card: React.FC<CardProps> = ({
  isSelected = false,
  isSelectMode = false,
  cardData,
  fallbackAvatar,
  isLoading = false,
  skeletonSize = 'medium',
}) => {
  if (isLoading) {
    return (
      <SkeletonCard
        disableTitle={!cardData?.title}
        skeletonSize={skeletonSize}
      />
    );
  }

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
            {cardData?.status === 'active' ? (
              <Badge className='mb-2 bg-green-200 text-green-800'>Live</Badge>
            ) : null}
          </div>
        </div>
        <div className={styles.cardText}>{cardData.content}</div>
      </div>
      <div className={cn(styles.cardRight, !cardData?.profile_picture_url && '!h-full !justify-end')}>
        <div className='flex h-full justify-start'>
          <div className={cn(styles.cardAvatar)}>
            <ImageWithFallback
              alt={cardData?.name ?? 'profile'}
              className='size-10'
              fallbackIcon={fallbackAvatar}
              size={40}
              src={cardData?.profile_picture_url}
            />
          </div>
        </div>

        <p className={styles.cardTime}>{cardData.lastUpdate}</p>
      </div>
    </div>
  );
};

export default Card;
