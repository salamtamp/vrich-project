'use client';

import React, { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import type { ReactNode } from 'react';

import ContentPagination from '@/components/content/pagination';
import DatePicker from '@/components/date-picker';
import NotificationBell from '@/components/notification-bell';
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
  const { ref } = useScrollable<HTMLDivElement>();
  const { pagination } = usePaginationContext();
  const { page, limit } = pagination;
  const searchParams = useSearchParams();

  const id = searchParams.get('id');

  const skeletonCount = limit;

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
              const isActive = item.id === id;

              return (
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                <div
                  key={`${item.id}-${crypto.randomUUID()}`}
                  className={cn(styles.cardContainer, isActive && '!border-blue-300', cardClassName)}
                  id={`card-${item.id}`}
                  onClick={() => {
                    onCardClick?.(item.id, item);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onCardClick?.(item.id, item);
                    }
                  }}
                >
                  <Card
                    cardData={item}
                    isSelectMode={false}
                    isSelected={false}
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
