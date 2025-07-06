'use client';

import React, { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { Trash } from 'lucide-react';

import ContentPagination from '@/components/content/pagination';
import DatePicker from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import usePaginationContext from '@/hooks/useContext/usePaginationContext';
import { useScrollable } from '@/hooks/useScrollable';
import { cn } from '@/lib/utils';

import type { CardData } from '../card';
import Card from '../card';

import styles from './filter-card.module.scss';

type FilterCardProps = {
  title: string;
  limitOptions?: number[];
  data?: CardData[];
  total?: number;
  onCardClick?: (id: string, item: CardData) => void;
};

const FilterCard: React.FC<FilterCardProps> = ({ title, limitOptions, data, total = 0, onCardClick }) => {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const { ref } = useScrollable<HTMLDivElement>();
  const { pagination } = usePaginationContext();
  const { page, limit } = pagination;

  const totalPages = Math.ceil(total / limit);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data ? data?.slice(startIndex, endIndex) : [];

  const isAllSelect = selectedIds.length === limit;

  const handleToggle = (c: string[], newId: string) => {
    const isSelected = selectedIds?.includes(newId);

    if (isSelected) {
      return c.filter((id) => {
        return id !== newId;
      });
    }
    return [...c, newId];
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className={styles.container}>
      <div className={styles.filterContainer}>
        <p className='ml-1 text-display-medium'>{title}</p>
        <div className='flex'>
          <DatePicker maxDate={dayjs()} />
        </div>
      </div>
      <div className='mt-3 flex justify-between'>
        <div className='flex h-full items-center'>
          Page {page} of {totalPages}
        </div>

        <div className='flex gap-2'>
          {isSelectMode ? (
            <Button
              disabled={!selectedIds.length}
              variant='outline'
              className={cn(
                'text-gray-600 transition-colors hover:border-red-200 hover:bg-red-100 hover:text-red-400'
              )}
            >
              <Trash />
            </Button>
          ) : null}
          {isSelectMode ? (
            <Button
              className={cn(isAllSelect && 'border-blue-300')}
              variant='outline'
              onClick={() => {
                if (isAllSelect) {
                  setSelectedIds([]);
                  return;
                }
                const allIds = paginatedData.map((d) => d.id);
                setSelectedIds(allIds);
              }}
            >
              Select All
            </Button>
          ) : null}

          <Button
            className={cn(isSelectMode && 'border-blue-300')}
            variant='outline'
            onClick={() => {
              setIsSelectMode((prev) => !prev);
              if (!isSelectMode) {
                setSelectedIds([]);
              }
            }}
          >
            Select
          </Button>
        </div>
      </div>
      <div
        ref={ref}
        className={cn(styles.cardItemContainer, styles.cardItemContainerScrollable)}
      >
        {paginatedData.map((item) => {
          const isSelected = selectedIds?.includes(item.id);

          return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
              key={item.id}
              className={cn(styles.itemCardContainer, isSelected && isSelectMode && '!border-blue-300')}
              onClick={() => {
                if (isSelectMode) {
                  setSelectedIds?.((c) => handleToggle(c, item.id));
                } else {
                  onCardClick?.(item.id, item);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (isSelectMode) {
                    e.preventDefault();
                    setSelectedIds?.((c) => handleToggle(c, item.id));
                  } else {
                    onCardClick?.(item.id, item);
                  }
                }
              }}
            >
              <Card
                cardData={item}
                isSelectMode={isSelectMode}
                isSelected={isSelected}
              />
            </div>
          );
        })}
      </div>
      <ContentPagination
        className='mt-5'
        limitOptions={limitOptions}
        total={total}
      />
    </div>
  );
};
export default FilterCard;
