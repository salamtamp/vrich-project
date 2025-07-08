'use client';

import React, { useEffect, useState } from 'react';

import { Trash } from 'lucide-react';
import type { ReactNode } from 'react';

import ContentPagination from '@/components/content/pagination';
import DatePicker from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import usePaginationContext from '@/hooks/useContext/usePaginationContext';
import { useScrollable } from '@/hooks/useScrollable';
import dayjs from '@/lib/dayjs';
import { cn } from '@/lib/utils';

import type { CardData } from '../card';
import Card from '../card';

import styles from './filter-card.module.scss';

type FilterCardProps = {
  title: ReactNode;
  limitOptions?: number[];
  data?: CardData[];
  total?: number;
  onCardClick?: (id: string, item: CardData) => void;
  className?: string;
  cardClassName?: string;
  cardItemClassName?: string;
  shotModePagination?: boolean;
  defaultStartDate?: dayjs.Dayjs;
  defaultEndDate?: dayjs.Dayjs;
  onConfirm?: (startDate: dayjs.Dayjs | null, endDate: dayjs.Dayjs | null) => void;
  isLoading?: boolean;
};

const FilterCard: React.FC<FilterCardProps> = ({
  title,
  limitOptions,
  data,
  total = 0,
  onCardClick,
  className,
  cardClassName,
  cardItemClassName,
  shotModePagination,
  defaultStartDate,
  defaultEndDate,
  onConfirm,
  isLoading = false,
}) => {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const { ref } = useScrollable<HTMLDivElement>();
  const { pagination } = usePaginationContext();
  const { page, limit } = pagination;

  const totalPages = Math.ceil(total / limit);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const paginatedData = data ?? [];
  const skeletonCount = limit;

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
    <div className={cn(styles.container, className)}>
      <div className={cn(styles.filterContainer)}>
        <div className='ml-1 text-xl-semibold'>{title}</div>
        <div className='flex'>
          <DatePicker
            defaultEndDate={defaultEndDate}
            defaultStartDate={defaultStartDate}
            maxDate={dayjs()}
            minDate={dayjs().subtract(3, 'month')}
            onConfirm={onConfirm}
          />
        </div>
      </div>
      <div className='mb-4 mt-3 flex justify-between'>
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
            className={cn('hidden', isSelectMode && 'border-blue-300')}
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
        className={cn(styles.cardItemContainer, styles.cardItemContainerScrollable, cardItemClassName)}
      >
        {isLoading
          ? Array.from({ length: skeletonCount }).map(() => {
              const key = crypto.randomUUID();
              return (
                <div
                  key={key}
                  className={cn(styles.cardContainer, cardClassName)}
                >
                  <Card
                    isLoading
                    cardData={{ id: key, lastUpdate: '' }}
                  />
                </div>
              );
            })
          : paginatedData.map((item) => {
              const isSelected = selectedIds?.includes(item.id);
              return (
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                <div
                  key={item.id}
                  className={cn(
                    styles.cardContainer,
                    isSelected && isSelectMode && '!border-blue-300',
                    cardClassName
                  )}
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
        shotMode={shotModePagination}
        total={total}
      />
    </div>
  );
};
export default FilterCard;
