/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
'use callback';
import { useCallback } from 'react';

import type { Dispatch, SetStateAction } from 'react';

import { cn } from '@/lib/utils';

import { Checkbox } from '../ui/checkbox';

export type TextData = {
  id: string;
  text: string;
  postUrl?: string;
};

type ListItemProps = {
  data: TextData;
  selectAbleMode?: boolean;
  isSelected?: boolean;
  setSelectedItems?: Dispatch<SetStateAction<string[]>>;
};

const ListItem: React.FC<ListItemProps> = ({
  data,
  selectAbleMode = false,
  isSelected = false,
  setSelectedItems,
}) => {
  const handleToggleSelection = useCallback(
    (isSelected: boolean, id: string) => {
      if (!isSelected) {
        setSelectedItems?.((prev) => [...prev, id]);
        return;
      }
      setSelectedItems?.((prev) => prev.filter((p) => p !== id));
    },
    [setSelectedItems]
  );

  return (
    <div className={cn('flex flex-1 flex-col justify-start py-2', data?.postUrl && 'pr-2')}>
      <div
        className={cn(
          'flex w-full justify-between gap-2',
          data?.postUrl && 'cursor-pointer rounded-lg px-2 py-3 hover:bg-gray-200'
        )}
        onClick={() => {
          if (data.postUrl) {
            window.open(data.postUrl, '_blank');
          }
        }}
      >
        <div className='flex w-full flex-col'>
          {data.postUrl ? (
            <p className='mb-2 w-[300px] truncate text-display-medium'>{data.postUrl}</p>
          ) : null}

          <div className='flex gap-4'>
            {selectAbleMode ? (
              <Checkbox
                checked={isSelected}
                className='size-7 rounded-md'
                onClick={() => {
                  handleToggleSelection(isSelected, data.id);
                }}
              />
            ) : null}
            <p className='flex h-full items-center'>{data.text}</p>
          </div>
        </div>
        <div className='flex h-full min-w-[100px] flex-col justify-between gap-2'>
          <p className='line-clamp-1 flex justify-end text-sm-medium'>2 min ago</p>
          <p className='line-clamp-1 flex justify-end text-xs-regular'>11/06/41 11:22</p>
        </div>
      </div>
      <div className='mt-2 h-[2px] w-full rounded-xl bg-gray-300' />
    </div>
  );
};

export default ListItem;
