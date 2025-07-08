'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import type { CardData } from '@/components/card';
import type { BreadcrumbItem } from '@/components/content/breadcrumb';
import BreadcrumbContent from '@/components/content/breadcrumb';
import FilterCard from '@/components/filter-card';
import { API } from '@/constants/api.constant';
import { PATH } from '@/constants/path.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import dayjs from '@/lib/dayjs';
import { cn, getRelativeTimeInThai } from '@/lib/utils';
import type { PaginationResponse } from '@/types/api/api-response';
import type { FacebookPostResponse } from '@/types/api/facebook-post';

import PostDetail from './(id)/post-detail';

import styles from './post.module.scss';

export type PostCard = CardData & { status: 'active' | 'inactive'; link?: string; customId?: string };

const Post = () => {
  const [postData, setPostData] = useState<PostCard[]>([]);
  const [selected, setSelected] = useState<PostCard>();

  const router = useRouter();

  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { handleConfirmPeriod, data, isLoading } = usePaginatedRequest<
    PaginationResponse<FacebookPostResponse>
  >({
    url: API.POST,
  });

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Post', push: PATH.POST },
    { label: `${selected?.customId}` },
  ];

  const itemData = useMemo(
    () =>
      data?.docs?.map((post) => ({
        id: post.id,
        content: (
          <div className='flex max-w-full flex-col gap-1'>
            <p className='line-clamp-4'>{post.message ?? 'ไม่มีข้อความ'}</p>
          </div>
        ),
        lastUpdate: getRelativeTimeInThai(post.created_at),
        profile_picture_url: post.profile?.profile_picture_url,
        status: post.status,
        link: post.link,
        title: post.profile?.name,
        customId: post.post_id,
      })),
    [data?.docs]
  );

  const handleCardClick = useCallback(
    (id: string) => {
      router.push(`${PATH.POST}/?id=${id}`);
      setSelected(postData?.find((item) => item.id === id));
    },
    [postData, router]
  );

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

  useEffect(() => {
    setPostData(itemData ?? []);

    const newSelect = itemData?.find((item) => item.id === id);
    if (newSelect) {
      setSelected(itemData?.find((item) => item.id === id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemData]);

  return (
    <div className={cn('flex size-full flex-1 overflow-hidden', id && 'gap-6')}>
      <FilterCard
        cardClassName='!max-h-[300px]'
        cardItemClassName={cn(id && '!grid-cols-1')}
        className={cn(id && styles.profileContainer)}
        data={postData}
        defaultEndDate={dayjs()}
        defaultStartDate={dayjs().subtract(6, 'day')}
        disableDatePicker={!!id}
        isLoading={isLoading}
        shotModePagination={!!id}
        skeletonSize='large'
        total={data?.total}
        title={
          id ? (
            <BreadcrumbContent
              items={breadcrumbItems}
              labelClassName='text-xl-semibold'
            />
          ) : (
            'Post'
          )
        }
        onCardClick={handleCardClick}
        onConfirmPeriod={handleConfirmPeriod}
      />

      {id ? (
        <PostDetail
          breadcrumbItems={breadcrumbItems}
          selectedPost={selected}
          onCheckedChange={handleCheckedChange}
        />
      ) : (
        <></>
      )}
    </div>
  );
};
export default Post;
