'use client';

import React, { useCallback, useMemo } from 'react';

import { useRouter } from 'next/navigation';

import type { CardData } from '@/components/card';
import FilterCard from '@/components/filter-card';
import { API } from '@/constants/api.constant';
import { PATH } from '@/constants/path.constant';
import usePaginatedRequest from '@/hooks/request/usePaginatedRequest';
import usePaginationContext from '@/hooks/useContext/usePaginationContext';
import dayjs from '@/lib/dayjs';
import { getRelativeTimeInThai } from '@/lib/utils';
import type { PaginationResponse } from '@/types/api/api-response';
import type { FacebookPostResponse } from '@/types/api/facebook-post';

export type PostCard = CardData & { status: 'active' | 'inactive'; link?: string; customId?: string };

const Post = () => {
  const router = useRouter();
  const { pagination } = usePaginationContext();
  const { page, limit } = pagination;

  const { handleConfirmPeriod, data, isLoading, since, until } = usePaginatedRequest<
    PaginationResponse<FacebookPostResponse>
  >({
    url: API.POST,
  });

  const itemData = useMemo(
    () =>
      data?.docs?.map((post) => ({
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
        title: post.profile?.name,
        customId: post.post_id,
      })),
    [data?.docs]
  );

  const handleCardClick = useCallback(
    (id: string) => {
      router.push(`${PATH.POST}?id=${id}&page=${page}&limit=${limit}&since=${since}&until=${until}`);
    },
    [limit, page, router, since, until]
  );

  return (
    <div className='flex size-full flex-1 overflow-hidden'>
      <FilterCard
        cardClassName='!max-h-[300px]'
        data={itemData}
        defaultEndDate={dayjs()}
        defaultStartDate={dayjs().subtract(6, 'day')}
        isLoading={isLoading}
        skeletonSize='large'
        title='Post'
        total={data?.total}
        onCardClick={handleCardClick}
        onConfirmPeriod={handleConfirmPeriod}
      />
    </div>
  );
};
export default Post;
