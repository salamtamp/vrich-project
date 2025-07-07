'use client';

import React, { useCallback } from 'react';

import type { CardData } from '@/components/card';
import FilterCard from '@/components/filter-card';
import TextList from '@/components/text-list';
import useModalContext from '@/hooks/useContext/useModalContext';

const itemData = Array.from({ length: 150 }, (_, i) => ({
  id: `${i + 1}`,
  title: 'จิมมี่ ปิยะวัช',
  content: 'น่ากินมาก',
  lastUpdate: '3 นาทีที่แล้ว',
}));

const Inbox = () => {
  const { open } = useModalContext();

  const handleCardClick = useCallback(
    (id: string, data: CardData) => {
      open({
        content: (
          <TextList
            cardData={data}
            defaultTab='inbox'
            id={id}
          />
        ),
      });
    },
    [open]
  );

  return (
    <FilterCard
      data={itemData}
      title='Inbox'
      total={itemData.length}
      onCardClick={handleCardClick}
    />
  );
};
export default Inbox;
