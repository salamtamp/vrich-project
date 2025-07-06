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

const textData = [
  {
    id: '1',
    text: 'คือ เนื้อหาจำลองแบบเรียบๆ ที่ใช้กันในธุรกิจงานพิมพ์หรืองานเรียงพิมพ์ มันได้กลายมาเป็นเนื้อหาจำลองมาตรฐาน',
  },
  {
    id: '2',
    text: '1960 เมื่อแผ่น Letraset วางจำหน่ายโดยมีข้อความบนนั้นเป็น Lorem Ipsum และล่าสุดกว่านั้น คือเมื่อซอฟท์แวร์การทำสื่อสิ่งพิมพ์ (Desktop Publishing) อย่าง Aldus PageMaker',
  },
  { id: '3', text: 'ภาษาอังกฤษที่' },
  {
    id: '4',
    text: '1960 เมื่อแผ่น Letraset วางจำหน่ายโดยมีข้อความบนนั้นเป็น Lorem Ipsum และล่าสุดกว่านั้น คือเมื่อซอฟท์แวร์การทำสื่อสิ่งพิมพ์ (Desktop Publishing) อย่าง Aldus PageMaker',
  },
  { id: '5', text: 'ภาษาอังกฤษที่' },
  { id: '6', text: 'ภาษาอังกฤษที่' },
  {
    id: '7',
    text: 'คือ เนื้อหาจำลองแบบเรียบๆ ที่ใช้กันในธุรกิจงานพิมพ์หรืองานเรียงพิมพ์ มันได้กลายมาเป็นเนื้อหาจำลองมาตรฐาน',
  },
  { id: '8', text: 'ภาษาอังกฤษที่' },
  { id: '9', text: 'ภาษาอังกฤษที่' },
  { id: '10', text: 'ภาษาอังกฤษที่' },
  { id: '11', text: 'ภาษาอังกฤษที่' },
  { id: '12', text: 'ภาษาอังกฤษที่' },
  { id: '13', text: 'ภาษาอังกฤษที่' },
  { id: '14', text: 'ภาษาอังกฤษที่' },
  { id: '15', text: 'ภาษาอังกฤษที่' },

  {
    id: '16',
    text: '1960 เมื่อแผ่น Letraset วางจำหน่ายโดยมีข้อความบนนั้นเป็น Lorem Ipsum และล่าสุดกว่านั้น คือเมื่อซอฟท์แวร์การทำสื่อสิ่งพิมพ์ (Desktop Publishing) อย่าง Aldus PageMaker',
  },
  {
    id: '17',
    text: '1960 เมื่อแผ่น Letraset วางจำหน่ายโดยมีข้อความบนนั้นเป็น Lorem Ipsum และล่าสุดกว่านั้น คือเมื่อซอฟท์แวร์การทำสื่อสิ่งพิมพ์ (Desktop Publishing) อย่าง Aldus PageMaker',
  },
  {
    id: '18',
    text: '1960 เมื่อแผ่น Letraset วางจำหน่ายโดยมีข้อความบนนั้นเป็น Lorem Ipsum และล่าสุดกว่านั้น คือเมื่อซอฟท์แวร์การทำสื่อสิ่งพิมพ์ (Desktop Publishing) อย่าง Aldus PageMaker',
  },
  {
    id: '19',
    text: '1960 เมื่อแผ่น Letraset วางจำหน่ายโดยมีข้อความบนนั้นเป็น Lorem Ipsum และล่าสุดกว่านั้น คือเมื่อซอฟท์แวร์การทำสื่อสิ่งพิมพ์ (Desktop Publishing) อย่าง Aldus PageMaker',
  },
  {
    id: '20',
    text: '1960 เมื่อแผ่น Letraset วางจำหน่ายโดยมีข้อความบนนั้นเป็น Lorem Ipsum และล่าสุดกว่านั้น คือเมื่อซอฟท์แวร์การทำสื่อสิ่งพิมพ์ (Desktop Publishing) อย่าง Aldus PageMaker',
  },
  {
    id: '21',
    text: '1960 เมื่อแผ่น Letraset วางจำหน่ายโดยมีข้อความบนนั้นเป็น Lorem Ipsum และล่าสุดกว่านั้น คือเมื่อซอฟท์แวร์การทำสื่อสิ่งพิมพ์ (Desktop Publishing) อย่าง Aldus PageMaker',
  },
  {
    id: '22',
    text: '1960 เมื่อแผ่น Letraset วางจำหน่ายโดยมีข้อความบนนั้นเป็น Lorem Ipsum และล่าสุดกว่านั้น คือเมื่อซอฟท์แวร์การทำสื่อสิ่งพิมพ์ (Desktop Publishing) อย่าง Aldus PageMaker',
  },
  {
    id: '23',
    text: '1960 เมื่อแผ่น Letraset วางจำหน่ายโดยมีข้อความบนนั้นเป็น Lorem Ipsum และล่าสุดกว่านั้น คือเมื่อซอฟท์แวร์การทำสื่อสิ่งพิมพ์ (Desktop Publishing) อย่าง Aldus PageMaker',
  },
];

const Message = () => {
  const { open } = useModalContext();

  const handleCardClick = useCallback(
    (id: string, data: CardData) => {
      open({
        content: (
          <TextList
            cardData={data}
            id={id}
            textData={textData}
          />
        ),
      });
    },
    [open]
  );

  return (
    <FilterCard
      data={itemData}
      title='Message'
      total={itemData.length}
      onCardClick={handleCardClick}
    />
  );
};
export default Message;
