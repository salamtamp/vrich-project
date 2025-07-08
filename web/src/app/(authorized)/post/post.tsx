'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import type { CardData } from '@/components/card';
import FilterCard from '@/components/filter-card';
import { API } from '@/constants/api.constant';
import { PATH } from '@/constants/path.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import dayjs from '@/lib/dayjs';
import { getRelativeTimeInThai } from '@/lib/utils';
import type { PaginationResponse } from '@/types/api/api-response';
import type { FacebookPostResponse } from '@/types/api/facebook-post';

import PostDetail from './(id)/post-detail';

export type PostCard = CardData & { status: 'active' | 'inactive' };

const Post = () => {
  const [postData, setPostData] = useState<PostCard[]>([]);

  const router = useRouter();

  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { handleConfirmPeriod, data, isLoading } = usePaginatedRequest<
    PaginationResponse<FacebookPostResponse>
  >({
    url: API.POST.PAGINATION,
  });

  const itemData = useMemo(
    () =>
      data?.docs?.map((post) => ({
        id: post.post_id,
        content: (
          <div className='flex max-w-full flex-col gap-1'>
            <p className='line-clamp-4'>{post.message ?? 'ไม่มีข้อความ'}</p>
          </div>
        ),
        lastUpdate: getRelativeTimeInThai(post.created_at),
        profile_picture_url: post.profile?.profile_picture_url,
        status: post.status,
      })),
    [data?.docs]
  );

  const handleCardClick = useCallback(
    (id: string) => {
      router.push(`${PATH.POST}/?id=${id}`);
    },
    [router]
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
  }, [itemData]);

  if (!id) {
    return (
      <FilterCard
        cardClassName='!max-h-[300px]'
        data={postData}
        defaultEndDate={dayjs()}
        defaultStartDate={dayjs().subtract(6, 'day')}
        isLoading={isLoading}
        skeletonSize='large'
        title='Post'
        total={data?.total}
        onCardClick={handleCardClick}
        onConfirmPeriod={handleConfirmPeriod}
      />
    );
  }

  return (
    <PostDetail
      isLoading={isLoading}
      items={postData}
      onCardClick={handleCardClick}
      onCheckedChange={handleCheckedChange}
      onConfirmPeriod={handleConfirmPeriod}
    />
  );
};
export default Post;
