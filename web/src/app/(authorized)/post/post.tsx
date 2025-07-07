'use client';

import React, { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import type { CardData } from '@/components/card';
import FilterCard from '@/components/filter-card';
import { PATH } from '@/constants/path.constant';

const itemData = Array.from({ length: 150 }, (_, i) => ({
  id: `${i + 1}`,
  title: 'LineMan',
  content: `กดอีโมจิเลย 
กินชาบูคนเดียวเหงา ๆ 😆
หรือกินก๋วยเตี๋ยวกับเพื่อนแบบม่วน ๆ ❤️
.`,
  lastUpdate: '3 นาทีที่แล้ว',
}));

const Post = () => {
  const router = useRouter();

  const handleCardClick = useCallback(
    (id: string, _: CardData) => {
      router.push(`${PATH.POST}/${id}`);
    },
    [router]
  );

  return (
    <FilterCard
      cardClassName='!max-h-[300px]'
      data={itemData}
      title='Post'
      total={itemData.length}
      onCardClick={handleCardClick}
    />
  );
};
export default Post;
