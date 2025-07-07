'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import type { CardData } from '@/components/card';
import type { BreadcrumbItem } from '@/components/content/breadcrumb';
import BreadcrumbContent from '@/components/content/breadcrumb';
import FilterCard from '@/components/filter-card';
import { PATH } from '@/constants/path.constant';
import { PaginationProvider } from '@/contexts';

import CommentList from './comment-list';

import styles from './post-detail.module.scss';

const itemData = Array.from({ length: 150 }, (_, i) => {
  const result = {
    id: `${i + 1}`,
    title: 'LineMan',
    content: `กดอีโมจิเลย 
กินชาบูคนเดียวเหงา ๆ 😆
หรือกินก๋วยเตี๋ยวกับเพื่อนแบบม่วน ๆ ❤️
จะชาบูหรือก๋วยเตี๋ยว อยู่ที่ไหนก็สั่งได้ สั่ง #LINEMANถูกสุดทุกวัน สั่งเลย`,
    lastUpdate: '3 นาทีที่แล้ว',
    isLiveMode: false,
  };
  if (i === 0) {
    return { ...result, isLiveMode: true };
  }
  return result;
});

const breadcrumbItems: BreadcrumbItem[] = [{ label: 'Post', href: PATH.POST }, { label: 'Post Detail' }];

const PostDetail = () => {
  const [postData, setPostData] = useState<CardData[]>([]);
  const router = useRouter();

  const params = useParams();
  const { id } = params;

  const handleCardClick = useCallback(
    (id: string, _: CardData) => {
      router.push(`${PATH.POST}/${id}`);
    },
    [router]
  );

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      setPostData((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return { ...item, isLiveMode: checked };
          }
          if (item.isLiveMode) {
            return { ...item, isLiveMode: false };
          }

          return item;
        })
      );
    },
    [id]
  );

  useEffect(() => {
    setPostData(itemData);
  }, []);

  return (
    <div className='flex size-full gap-6 overflow-hidden'>
      <FilterCard
        shotModePagination
        cardItemClassName='!grid-cols-2'
        className={styles.profileContainer}
        data={postData}
        total={postData.length}
        title={
          <BreadcrumbContent
            items={breadcrumbItems}
            labelClassName='text-xl-semibold'
          />
        }
        onCardClick={handleCardClick}
      />
      <PaginationProvider>
        <div className='flex size-full min-w-[600px] flex-1 flex-col justify-between overflow-hidden'>
          <div className={styles.detailBreadcrumbContainer}>
            <BreadcrumbContent
              items={breadcrumbItems}
              labelClassName='text-xl-semibold'
            />
          </div>
          <div className={styles.detailContainer}>
            <CommentList onCheckedChange={handleCheckedChange} />
          </div>
        </div>
      </PaginationProvider>
    </div>
  );
};
export default PostDetail;
