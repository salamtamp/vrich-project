'use client';

import React from 'react';

import FilterCard from '@/components/filter-card';

const itemData = Array.from({ length: 150 }, (_, i) => ({
  id: `${i + 1}`,
  title: 'จิมมี่ ปิยะวัช',
  content:
    'มาแล้วคู่เเข่งตี๋น้อย5555 กินประจำตั้งแต่ 14-15 เปิดตอนไหนและจะได้ เปิดตอนไหนมาแล้วคู่เเข่งตี๋น้อย5555 กินประจำตั้งแต่ 14-15 เปิดตอนไหนและจะได้',
  lastUpdate: '3 นาทีที่แล้ว',
}));

const Comment = () => {
  return (
    <FilterCard
      data={itemData}
      title='Comment'
      total={itemData.length}
    />
  );
};
export default Comment;
