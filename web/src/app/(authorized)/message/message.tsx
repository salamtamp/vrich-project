'use client';

import React from 'react';

import FilterCard from '@/components/filter-card';

const itemData = Array.from({ length: 150 }, (_, i) => ({
  id: `${i + 1}`,
  title: 'จิมมี่ ปิยะวัช',
  content: 'น่ากินมาก',
  lastUpdate: '3 นาทีที่แล้ว',
}));

const Message = () => {
  return (
    <FilterCard
      data={itemData}
      title='Message'
      total={itemData.length}
    />
  );
};
export default Message;
