'use client';

import React, { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { Trash } from 'lucide-react';
import type { ReactNode } from 'react';

import ContentPagination from '@/components/content/pagination';
import DatePicker from '@/components/date-picker';
import NotificationBell from '@/components/notification-bell';
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
  onConfirmPeriod?: (startDate: dayjs.Dayjs | null, endDate: dayjs.Dayjs | null) => void;
  isLoading?: boolean;
  skeletonSize?: 'small' | 'medium' | 'large';
  disableDatePicker?: boolean;
  disableNotificationBell?: boolean;
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
  onConfirmPeriod,
  isLoading = false,
  skeletonSize = 'medium',
  disableDatePicker = false,
  disableNotificationBell = false,
}) => {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const { ref } = useScrollable<HTMLDivElement>();
  const { pagination } = usePaginationContext();
  const { page, limit } = pagination;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const searchParams = useSearchParams();

  const id = searchParams.get('id');

  const skeletonCount = limit;

  const isAllSelect = selectedIds.length === limit;

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

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
      <div className={cn(styles.filterContainer, 'text-gray-800')}>
        <div className='ml-1 text-xl-semibold'>{title}</div>
        <div className='mr-4 flex flex-row items-center gap-6'>
          {!disableDatePicker ? (
            <div className='flex'>
              <DatePicker
                className='w-fit'
                defaultEndDate={defaultEndDate}
                defaultStartDate={defaultStartDate}
                maxDate={dayjs()}
                minDate={dayjs().subtract(3, 'month')}
                onConfirm={onConfirmPeriod}
              />
            </div>
          ) : null}

          {!disableNotificationBell && <NotificationBell />}
        </div>
      </div>
      <div className='mb-4 mt-5 flex justify-between text-gray-800'>
        <div className='flex h-full items-center'>{`Showing ${start}–${end} of ${total} items`}</div>

        <div className='flex gap-2'>
          {isSelectMode ? (
            <Button
              disabled={!selectedIds.length}
              variant='outline'
              className={cn(
                'text-gray-800 transition-colors hover:border-red-200 hover:bg-red-100 hover:text-red-400'
              )}
            >
              <Trash />
            </Button>
          ) : null}
          {isSelectMode ? (
            <Button
              className={cn('text-gray-800', isAllSelect && 'border-blue-300')}
              variant='outline'
              onClick={() => {
                if (isAllSelect) {
                  setSelectedIds([]);
                  return;
                }
                const allIds = (data ?? []).map((d) => d.id);
                setSelectedIds(allIds);
              }}
            >
              Select All
            </Button>
          ) : null}

          <Button
            className={cn('hidden text-gray-800', isSelectMode && 'border-blue-300')}
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
                    skeletonSize={skeletonSize}
                  />
                </div>
              );
            })
          : (data ?? []).map((item) => {
              const isSelected = selectedIds?.includes(item.id);

              const isActive = item.id === id;

              return (
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                <div
                  key={`${item.id}-${crypto.randomUUID()}`}
                  id={`card-${item.id}`}
                  className={cn(
                    styles.cardContainer,
                    isActive && '!border-blue-300',
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
                    skeletonSize={skeletonSize}
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
