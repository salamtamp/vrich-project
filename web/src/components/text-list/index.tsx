import { useCallback, useEffect, useState } from 'react';

import { ProfileMaleIcon } from '@public/assets/icon';
import { Trash } from 'lucide-react';

import usePaginationContext from '@/hooks/useContext/usePaginationContext';
import { cn } from '@/lib/utils';

import type { CardData } from '../card';
import ContentPagination from '../content/pagination';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';

type TextData = {
  id: string;
  text: string;
};

type TextListProps = {
  id?: string;
  cardData?: CardData;
  textData?: TextData[];
};

const TextList: React.FC<TextListProps> = ({ cardData, textData = [] }) => {
  const [selectAbleMode, setSelectAbleMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { update, reset } = usePaginationContext();

  const allItemIds = textData.map((i) => i.id) || [];
  const isSelectAll = allItemIds.length && selectedItems.length && allItemIds.length === selectedItems.length;

  const { title } = cardData ?? {};

  const handleToggleSelection = useCallback((isSelected: boolean, id: string) => {
    if (!isSelected) {
      setSelectedItems((prev) => [...prev, id]);
      return;
    }
    setSelectedItems((prev) => prev.filter((p) => p !== id));
  }, []);

  useEffect(() => {
    update({ limit: 20 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <div className='flex w-full max-w-full flex-col sm:w-[400px] md:w-[660px]'>
      <div className='mr-10 flex justify-between overflow-hidden'>
        <div className='flex items-center gap-2'>
          <ProfileMaleIcon />
          <p className='text-display-medium'>{title}</p>
        </div>
        <div className='flex items-center gap-2'>
          {selectAbleMode ? (
            <>
              <Button
                className='px-[10px] py-[2px] text-gray-600 transition-colors hover:border-red-200 hover:bg-red-100 hover:text-red-400'
                disabled={!selectedItems.length}
                variant='outline'
              >
                <Trash />
              </Button>
              <Button
                variant='outline'
                className={
                  (cn('px-[10px] py-[2px] text-gray-600 transition-colors'),
                  isSelectAll ? 'border-blue-300' : '')
                }
                onClick={() => {
                  if (isSelectAll) {
                    setSelectedItems([]);
                    return;
                  }
                  setSelectedItems(allItemIds);
                }}
              >
                <p>Select All</p>
              </Button>
            </>
          ) : null}

          <Button
            variant='outline'
            className={cn(
              'px-[10px] py-[2px] text-gray-600 transition-colors',
              selectAbleMode && 'border-blue-300'
            )}
            onClick={() => {
              if (allItemIds) {
                setSelectedItems([]);
              }
              setSelectAbleMode((prev) => !prev);
            }}
          >
            <p>Select</p>
          </Button>
        </div>
      </div>
      <div className='mt-4 flex max-h-[520px] min-h-[200px] flex-1 flex-col overflow-scroll pr-2'>
        {textData?.map((t) => {
          const isSelected = selectedItems.includes(t.id);
          return (
            <div
              key={t.id}
              className='flex flex-1 flex-col justify-start py-2'
            >
              <div className='flex w-full justify-between gap-2'>
                <div className='flex gap-4'>
                  {selectAbleMode ? (
                    <Checkbox
                      checked={isSelected}
                      className='size-7 rounded-md'
                      onClick={() => {
                        handleToggleSelection(isSelected, t.id);
                      }}
                    />
                  ) : (
                    ''
                  )}
                  <p className='flex h-full items-center'>{t.text}</p>
                </div>
                <div className='flex h-full min-w-[100px] flex-col justify-between gap-2'>
                  <p className='line-clamp-1 flex justify-end text-sm-medium'>2 min ago</p>
                  <p className='line-clamp-1 flex justify-end text-xs-regular'>11/06/41 11:22</p>
                </div>
              </div>
              <div className='mt-2 h-[2px] w-full rounded-xl bg-gray-300' />
            </div>
          );
        })}
      </div>
      <ContentPagination
        className='mt-2'
        limitOptions={[20, 40, 100, 200]}
        total={40}
      />
    </div>
  );
};

export default TextList;
