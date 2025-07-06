'use client';

import React from 'react';

import FilterCard from '@/components/filter-card';

const MockContent = () => {
  return (
    <div className='flex flex-col'>
      <p>type: user</p>
      <p>facebook_id: 0001</p>
    </div>
  );
};

const Comment = () => {
  const itemData = Array.from({ length: 150 }, (_, i) => ({
    id: `${i + 1}`,
    title: 'จิมมี่ ปิยะวัช',
    content: <MockContent />,
    lastUpdate: '3 นาทีที่แล้ว',
  }));

  return (
    <FilterCard
      data={itemData}
      title='Profile'
      total={itemData.length}
    />
  );
};
export default Comment;
