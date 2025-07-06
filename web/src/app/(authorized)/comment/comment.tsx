'use client';

import React, { useCallback } from 'react';

import type { CardData } from '@/components/card';
import FilterCard from '@/components/filter-card';
import TextList from '@/components/text-list';
import useModalContext from '@/hooks/useContext/useModalContext';

const itemData = Array.from({ length: 150 }, (_, i) => ({
  id: `${i + 1}`,
  title: 'จิมมี่ ปิยะวัช',
  content:
    'มาแล้วคู่เเข่งตี๋น้อย5555 กินประจำตั้งแต่ 14-15 เปิดตอนไหนและจะได้ เปิดตอนไหนมาแล้วคู่เเข่งตี๋น้อย5555 กินประจำตั้งแต่ 14-15 เปิดตอนไหนและจะได้',
  lastUpdate: '3 นาทีที่แล้ว',
}));

const Comment = () => {
  const { open } = useModalContext();

  const handleCardClick = useCallback(
    (id: string, data: CardData) => {
      open({
        content: (
          <TextList
            cardData={data}
            id={id}
            textData={[
              {
                id: '1',
                text: 'คือ เนื้อหาจำลองแบบเรียบๆ ที่ใช้กันในธุรกิจงานพิมพ์หรืองานเรียงพิมพ์ มันได้กลายมาเป็นเนื้อหาจำลองมาตรฐาน',
              },
            ]}
          />
        ),
      });
    },
    [open]
  );

  return (
    <FilterCard
      data={itemData}
      title='Comment'
      total={itemData.length}
      onCardClick={handleCardClick}
    />
  );
};
export default Comment;
