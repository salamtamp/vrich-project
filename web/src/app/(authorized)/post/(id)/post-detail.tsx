'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import type { Dayjs } from 'dayjs';

import type { BreadcrumbItem } from '@/components/content/breadcrumb';
import BreadcrumbContent from '@/components/content/breadcrumb';
import FilterCard from '@/components/filter-card';
import { API } from '@/constants/api.constant';
import { PATH } from '@/constants/path.constant';
import { PaginationProvider } from '@/contexts';
import useRequest from '@/hooks/request/useRequest';
import usePaginationContext from '@/hooks/useContext/usePaginationContext';
import dayjs from '@/lib/dayjs';
import { cn, getRelativeTimeInThai } from '@/lib/utils';
import type { FacebookPostResponse } from '@/types/api';
import type { PaginationResponse } from '@/types/api/api-response';

import type { PostCard } from '../post';

import CommentList from './comment-list';

import styles from './post-detail.module.scss';

const PostDetail = () => {
  const searchParams = useSearchParams();

  const id = searchParams.get('id');
  const paramSince = searchParams.get('since');
  const paramUntil = searchParams.get('until');

  const [postData, setPostData] = useState<PostCard[]>([]);
  const [selected, setSelected] = useState<PostCard>();

  const [since, setSince] = useState<string | null>(dayjs(paramSince).startOf('day').toISOString());
  const [until, setUntil] = useState<string | null>(dayjs(paramUntil).endOf('day').toISOString());

  const handleConfirmPeriod = useCallback((startDate: Dayjs | null, endDate: Dayjs | null) => {
    setSince(startDate ? startDate.startOf('day').toISOString() : null);
    setUntil(endDate ? endDate.endOf('day').toISOString() : null);
  }, []);

  const { data, isLoading, handleRequest } = useRequest<PaginationResponse<FacebookPostResponse>>({
    request: { url: API.POST, params: { order_by: 'published_at' } },
  });

  const { pagination } = usePaginationContext();

  const router = useRouter();

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [{ label: 'Post', push: PATH.POST }], []);

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      setPostData((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return { ...item, status: checked ? 'active' : 'inactive' };
          }
          if (item.status === 'active') {
            return { ...item, status: 'inactive' };
          }

          return item;
        })
      );
    },
    [id]
  );

  const handleCardClick = useCallback(
    (id: string) => {
      router.push(
        `${PATH.POST}?id=${id}&page=${pagination.page}&limit=${pagination.limit}&since=${paramSince}&until=${paramUntil}`
      );
    },
    [pagination.limit, pagination.page, router, paramSince, paramUntil]
  );

  useEffect(() => {
    const itemData = data?.docs?.map((post) => ({
      id: post.id,
      content: (
        <div className='flex max-w-full flex-col gap-1'>
          <p className='line-clamp-4'>{post.message ?? 'ไม่มีข้อความ'}</p>
        </div>
      ),
      lastUpdate: getRelativeTimeInThai(post.published_at),
      profile_picture_url: post.profile?.profile_picture_url,
      status: post.status,
      link: post.link,
      name: post.profile?.name,
      customId: post.post_id,
    }));

    setPostData(itemData ?? []);

    const newSelect = itemData?.find((item) => item.id === id);

    if (newSelect) {
      setSelected(itemData?.find((item) => item.id === id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.timestamp]);

  useEffect(() => {
    if (!id) {
      return;
    }

    setTimeout(() => {
      const el = document.getElementById(`card-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  }, [postData, id]);

  useEffect(() => {
    const newParams = { id, offset: pagination.offset, limit: pagination.limit, since, until };

    void handleRequest({ params: newParams });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.limit, pagination.offset, since, until, id]);

  return (
    <div className='flex size-full flex-1 gap-6 overflow-hidden'>
      <FilterCard
        disableDatePicker
        shotModePagination
        cardClassName='!max-h-[300px]'
        cardItemClassName='!grid-cols-1'
        className={cn(styles.profileContainer, '!w-[400px] !min-w-[400px] !max-w-[400px]')}
        data={postData}
        defaultEndDate={dayjs()}
        defaultStartDate={dayjs().subtract(6, 'day')}
        isLoading={isLoading}
        skeletonSize='large'
        total={data?.total}
        title={
          <BreadcrumbContent
            items={breadcrumbItems}
            labelClassName='text-xl-semibold'
          />
        }
        onCardClick={handleCardClick}
        onConfirmPeriod={handleConfirmPeriod}
      />
      <div className='flex size-full max-w-full flex-1 flex-col justify-between overflow-hidden'>
        <div className={styles.detailBreadcrumbContainer}>
          <BreadcrumbContent
            items={breadcrumbItems}
            labelClassName='text-xl-semibold'
          />
        </div>
        <div className={styles.detailContainer}>
          <PaginationProvider defaultValue={{ limit: 5 }}>
            <CommentList
              image={selected?.profile_picture_url}
              link={selected?.link}
              name={selected?.name}
              status={selected?.status}
              onCheckedChange={handleCheckedChange}
            />
          </PaginationProvider>
        </div>
      </div>
    </div>
  );
};
export default PostDetail;
