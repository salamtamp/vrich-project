'use client';

import React from 'react';

import { useSearchParams } from 'next/navigation';

import dayjs from 'dayjs';

import type { CardData } from '@/components/card';
import type { BreadcrumbItem } from '@/components/content/breadcrumb';
import BreadcrumbContent from '@/components/content/breadcrumb';
import FilterCard from '@/components/filter-card';
import { PATH } from '@/constants/path.constant';
import { PaginationProvider } from '@/contexts';

import CommentList from './comment-list';

import styles from './post-detail.module.scss';

type PostCard = CardData & { status: 'active' | 'inactive' };

type PostDetailProps = {
  items?: PostCard[];
  isLoading?: boolean;
  onConfirmPeriod: (startDate: dayjs.Dayjs | null, endDate: dayjs.Dayjs | null) => void;
  onCardClick?: (id: string) => void;
  onCheckedChange?: (checked: boolean) => void;
};

const PostDetail: React.FC<PostDetailProps> = ({
  items = [],
  isLoading = false,
  onConfirmPeriod,
  onCardClick,
  onCheckedChange,
}) => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const selected = items.find((item) => item.id === id);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Post', href: PATH.POST },
    { label: `${selected?.id}` },
  ];

  return (
    <div className='flex size-full gap-6 overflow-hidden'>
      <FilterCard
        disableDatePicker
        shotModePagination
        cardItemClassName='!grid-cols-1'
        className={styles.profileContainer}
        data={items || []}
        defaultEndDate={dayjs()}
        defaultStartDate={dayjs().subtract(6, 'day')}
        isLoading={isLoading}
        total={items?.length}
        title={
          <BreadcrumbContent
            items={breadcrumbItems}
            labelClassName='text-xl-semibold'
          />
        }
        onCardClick={onCardClick}
        onConfirmPeriod={onConfirmPeriod}
      />
      <PaginationProvider>
        <div className='flex size-full min-w-[600px] flex-1 flex-col justify-between overflow-hidden'>
          <div className={styles.detailBreadcrumbContainer}>
            <BreadcrumbContent
              items={breadcrumbItems}
              labelClassName='text-xl-semibold'
            />
          </div>
          <div className={styles.detailContainer}>
            <CommentList onCheckedChange={onCheckedChange} />
          </div>
        </div>
      </PaginationProvider>
    </div>
  );
};
export default PostDetail;
